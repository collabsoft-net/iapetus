import { EncryptionManager, EncryptionManagerOptions } from '@collabsoft-net/encryption';
import { isOfType } from '@collabsoft-net/helpers';
import { CachingExpirationPolicy, CachingService, Type } from '@collabsoft-net/types';
import { createHash, randomBytes } from 'crypto';
import { createClient, RedisClientOptions, RedisClientType, RedisFunctions, RedisModules, RedisScripts, RespVersions, TypeMapping } from 'redis';

const DEFAULT_TTL = 30 * 60;

interface RedisServiceOptions {
  primaryEndpoint: RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;
  readEndpoint?: RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;
  expirationPolicy?: CachingExpirationPolicy;
  defaultExpirationInSeconds?: number;
  verbose?: boolean;
  encryption?: {
    salt: string;
    options: EncryptionManagerOptions;
  }
}

type EncryptedCacheItem = {
  salt: string;
  nonce: string;
  value: string;
  _type: 'EncryptedCacheItem'
};

export class RedisService implements CachingService {

  private primaryEndpoint: RedisClientType<RedisModules, RedisFunctions, RedisScripts, RespVersions, TypeMapping>;
  private writeTimeout: number;

  private readEndpoint: RedisClientType<RedisModules, RedisFunctions, RedisScripts, RespVersions, TypeMapping>;
  private readTimeout: number;

  private expirationPolicy: CachingExpirationPolicy;
  private defaultExpirationInSeconds: number;
  private verbose: boolean;

  private salt?: string;
  private encryptionManager?: EncryptionManager;

  constructor(options: RedisServiceOptions) {
    this.primaryEndpoint = createClient(options.primaryEndpoint);
    this.writeTimeout = options.primaryEndpoint.socket?.connectTimeout || (30 * 1000);

    this.readEndpoint = options.readEndpoint ? createClient(options.readEndpoint) : this.primaryEndpoint;
    this.readTimeout = options.readEndpoint?.socket?.connectTimeout || options.primaryEndpoint.socket?.connectTimeout || (30 * 1000);

    this.expirationPolicy = options.expirationPolicy || 'expireAfterWrite';
    this.defaultExpirationInSeconds = options.defaultExpirationInSeconds || DEFAULT_TTL;
    this.verbose = options.verbose || false;

    if (options.encryption) {
      this.salt = options.encryption.salt;
      this.encryptionManager = new EncryptionManager(options.encryption.options);
    }

    this.primaryEndpoint.connect();
    if (options.readEndpoint) {
      this.readEndpoint.connect();
    }

  }

  async has(key: string|Array<string>): Promise<boolean> {
    if (!this.readEndpoint.isReady) {
      throw new Error('[REDIS] Server is not ready for connection, cannot determine if cache key exists');
    }

    const result = await this.withTimeout(async () => this.readEndpoint.exists(key), this.readTimeout);
    if (this.verbose) {
      console.info(result > 0 ? `[REDIS] ${key} exists in cache` : `[REDIS] ${key} does not exist in cache`);
    }
    return result > 0;
  }

  async get<T>(key: string): Promise<T|null>;
  async get<T>(key: string, loader: () => Promise<T>, forceRefresh?: boolean): Promise<T>;
  async get<T>(key: string, loader: () => Promise<T>, expiresInSeconds?: number, forceRefresh?: boolean): Promise<T>;
  async get<T>(type: Type<T>, key: string): Promise<T|null>;
  async get<T>(type: Type<T>, key: string, loader: () => Promise<T>, forceRefresh?: boolean): Promise<T>;
  async get<T>(type: Type<T>, key: string, loader: () => Promise<T>, expiresInSeconds?: number, forceRefresh?: boolean): Promise<T>;
  async get<T>(typeOrKey: Type<T>|string, keyOrLoader?: string|(() => Promise<T>), loaderOrDurationOrForceRefresh?: number|boolean|(() => Promise<T>), durationOrForceRefresh?: number|boolean, forced?: boolean): Promise<T|null> {

    const { type, key, loader, expiresInSeconds, forceRefresh } = {
      type: typeof typeOrKey === 'string' ? null : typeOrKey,
      key: typeof typeOrKey === 'string' ? typeOrKey : typeof keyOrLoader === 'string' ? keyOrLoader : null,
      loader: typeof keyOrLoader === 'function' ? keyOrLoader : typeof loaderOrDurationOrForceRefresh === 'function' ? loaderOrDurationOrForceRefresh : null,
      expiresInSeconds: typeof durationOrForceRefresh === 'number' ? durationOrForceRefresh : this.defaultExpirationInSeconds,
      forceRefresh: typeof loaderOrDurationOrForceRefresh === 'boolean' ? loaderOrDurationOrForceRefresh : typeof durationOrForceRefresh === 'boolean' ? durationOrForceRefresh : typeof forced === 'boolean' ? forced : null
    }

    if (!key) {
      throw new Error('[REDIS] Invalid argument, required parameter `key` is missing');
    }

    if (!this.readEndpoint.isReady) {
      if (this.verbose) {
        console.info(`[REDIS] miss from cache for key ${key}, server is not ready`);
      }
      return loader ? loader() : null;
    }

    if (forceRefresh === true) {
      if (this.verbose) {
        console.info(`[REDIS] force refresh requested, flushing key ${key}`);
      }
      await this.flush(key).catch(() => {});
    }

    const reply = await this.withTimeout(async () => this.readEndpoint.get(key), this.readTimeout).catch(() => null);
    if (reply) {
      if (this.verbose) {
        console.info(`[REDIS] hit from cache for key ${key}`);
      }

      if (this.expirationPolicy === 'expireAfterAccess') {
        if (this.primaryEndpoint.isReady) {
          if (this.verbose) {
            console.info(`[REDIS] Refreshing expiration time of ${key}, adding another ${expiresInSeconds} seconds`);
          }
          await this.withTimeout(async () => this.primaryEndpoint.expire(key, expiresInSeconds), this.writeTimeout).catch(() => {});
        } else {
          if (this.verbose) {
            console.info(`[REDIS] Unable to refresh expiration time of ${key}, primary endpoint not available`);
          }
        }
      }

      try {
        let result: T = JSON.parse(reply);

        // Check if this is an encrypted cache item
        if (isOfType<EncryptedCacheItem>(result, '_type') && result._type === 'EncryptedCacheItem') {

          if (this.verbose) {
            console.info(`[REDIS] cached data for key ${key} has been encrypted, trying to decrypt`);
          }

          // Make sure that we are able to decrypt the data
          if (!this.encryptionManager || !this.encryptionManager.isEncrypted(result.value)) {
            throw new Error('[REDIS] the retrieved data has been encrypted, but cannot be decrypted as this instance has not been initialized with caching or the retrieved data has been corrupted');
          }

          if (this.verbose) {
            console.info(`[REDIS] decrypting cached data for key ${key}`);
          }

          // Decrypt the data and replace the result with the actual value of the cached item
          result = this.encryptionManager.decrypt(result.value, result.salt, result.nonce);
        }

        return type ? new type(result) : result;
      } catch (error) {
        if (this.verbose) {
          console.error(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
        }
        await this.flush(key).catch(() => {});
        const result = loader ? loader() : null;
        if (result) {
          await this.set(key, result, expiresInSeconds).catch(() => {});
          return type ? new type(result) : result;
        }
      }
    } else if (loader) {
      try {
        if (this.verbose) {
          console.info(`[REDIS] miss from cache for key ${key}, trying to retrieve from loader`);
        }
        const result = await loader();
        if (result) {
          await this.set(key, result, expiresInSeconds).catch(() => {});
          return type ? new type(result) : result;
        }
        if (this.verbose) {
          console.info(`[REDIS] miss from loader for key ${key}`);
        }
        return null;
      } catch (error) {
        if (this.verbose) {
          console.error(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
        }
        return null;
      }
    }

    if (this.verbose) {
      console.info(`[REDIS] miss from both cache and loader for key ${key}`);
    }
    return null;
  }

  async set<T>(key: string, data: T, expiresInSeconds: number = this.defaultExpirationInSeconds, encrypt: boolean = false): Promise<void> {
    if (!this.primaryEndpoint.isReady) {
      if (this.verbose) {
        console.error(`[REDIS] cannot store data for key ${key}, server is not ready`);
      }
      throw new Error(`[REDIS] cannot store data for key ${key}, server is not ready`);
    }

    try {
      let payload = JSON.stringify(data);
      if (this.verbose) {
        console.info(`[REDIS] caching data for key ${key} (expires in ${expiresInSeconds} seconds)`);
      }

      // Check if we should be encrypting the data
      if (encrypt && this.encryptionManager && this.salt) {

        if (this.verbose) {
          console.info(`[REDIS] encrypting has been enabled for ${key}, encrypting data`);
        }

        // Generate the nonce specifically for this cache item
        const nonce = randomBytes(16)

        // We need to create a wrapper item to ensure we also store the salt & nonce
        const encryptedCacheItem: EncryptedCacheItem = {
          salt: this.salt,
          nonce: nonce.toString('hex'),
          value: this.encryptionManager.encrypt(payload, this.salt, nonce),
          _type: 'EncryptedCacheItem'
        };

        // Update the payload to the new encrypted cache item
        payload = JSON.stringify(encryptedCacheItem);
      }

      await this.withTimeout(async () => this.primaryEndpoint.setEx(key, expiresInSeconds, payload), this.writeTimeout);
    } catch (error) {
      if (this.verbose) {
        console.error(`[REDIS] An unexpected error occurred while storing data for key ${key}`, error, data);
      }
      throw error;
    }
  }

  async flush(key: string|Array<string>): Promise<void> {
    const keys = Array.isArray(key) ? key : [ key ];

    if (!this.primaryEndpoint.isReady) {
      if (this.verbose) {
        console.info(`[REDIS] cannot flush key(s) '${keys.join(',')}', server is not ready`);
      }
    } else {
      if (this.verbose) {
        console.info(`[REDIS] flushing key(s) '${keys.join(',')}'`);
      }
      await this.withTimeout(() => this.primaryEndpoint.unlink(keys), this.writeTimeout);
    }
  }

  async flushAll() {
    if (!this.primaryEndpoint.isReady) {
      if (this.verbose) {
        console.info(`[REDIS] cannot flush, server is not ready`);
      }
    } else {
      if (this.verbose) {
        console.info(`[REDIS] flushing all keys`);
      }
      await this.withTimeout(() => this.primaryEndpoint.flushAll(), this.writeTimeout);
    }
  }

  toCacheKey(...args: Array<string|number|undefined>): string {
    const value = args.filter(item => item !== undefined).join('-');
    const result = createHash('md5').update(value).digest('hex');
    if (this.verbose) {
      console.info(`[REDIS] Created cache key '${result}' based on provided arguments '${value}'`);
    }
    return result;
  }

  // Inspiration taken from https://advancedweb.hu/how-to-add-timeout-to-a-promise-in-javascript/
  private async withTimeout<T>(executor: () => Promise<T>, timeout: number): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    return Promise.race([
      executor(),
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new RedisTimeoutError()), timeout)
      })
    ]).finally(() => clearTimeout(timeoutId));
  }

  static getIdentifier(): symbol {
    return Symbol.for('RedisService');
  }

}

export class RedisTimeoutError extends Error {}
