import { EncryptionManager, EncryptionManagerOptions } from '@collabsoft-net/encryption';
import { isOfType } from '@collabsoft-net/helpers';
import { CacheOptions, CacheOptionsWithLoader, CachingExpirationPolicy, CachingService, Type } from '@collabsoft-net/types';
import { createHash, randomBytes } from 'crypto';

const DEFAULT_TTL = 30 * 60;

export interface CacheServiceOptions {
  verbose?: boolean;
  logger?: Console;
  expirationInSeconds?: number;
  expirationPolicy?: CachingExpirationPolicy;
  encrypted?: boolean;
  encryption?: {
    salt: string;
    options: EncryptionManagerOptions;
  }
  readTimeout?: number;
  writeTimeout?: number;
}

export interface CacheItem extends CacheOptions {
  value: string;
  _type: 'CacheItem';
}

export interface EncryptedCacheItem extends CacheItem {
  salt: string;
  nonce: string;
  encrypted: true;
};

export abstract class AbstractCacheService implements CachingService {

  protected verbose: boolean;
  protected logger: Console;

  private defaultExpirationPolicy: CachingExpirationPolicy;
  private defaultExpirationInSeconds: number;
  private defaultEncrypted: boolean;

  private salt?: string;
  private encryptionManager?: EncryptionManager;

  protected readTimeout: number;
  protected writeTimeout: number;

  constructor(options: CacheServiceOptions) {
    this.defaultExpirationPolicy = options.expirationPolicy || 'expireAfterWrite';
    this.defaultExpirationInSeconds = options.expirationInSeconds || DEFAULT_TTL;
    this.defaultEncrypted = options.encrypted || false;
    this.verbose = options.verbose || false;
    this.readTimeout = options.readTimeout || (30 * 1000);
    this.writeTimeout = options.writeTimeout || (30 * 1000);
    this.logger = options.logger || console;

    if (options.encryption) {
      this.salt = options.encryption.salt;
      this.encryptionManager = new EncryptionManager(options.encryption.options);
    }
  }

  protected abstract get logPrefix(): string;
  protected abstract get isReadReady(): boolean;
  protected abstract get isWriteReady(): boolean;
  protected abstract $read(key: string): Promise<string|null>;
  protected abstract $write(key: string, data: string, expireInSeconds: number): Promise<void>;
  protected abstract $touch(key: string, expireInSeconds: number): Promise<void>;

  abstract has(key: string|Array<string>): Promise<boolean>;

  async get<T>(key: string): Promise<T | null>;
  async get<T>(key: string, options: CacheOptionsWithLoader<T>): Promise<T | null>;
  async get<T>(key: string, loader: () => Promise<T>): Promise<T>;
  async get<T>(key: string, loader: () => Promise<T>, options: CacheOptions): Promise<T>;
  async get<T>(key: string, loader: () => Promise<T>, forceRefresh: boolean): Promise<T>;
  async get<T>(key: string, loader: () => Promise<T>, forceRefresh: boolean, options: CacheOptions): Promise<T>;
  async get<T>(type: Type<T>, key: string): Promise<T | null>;
  async get<T>(type: Type<T>, key: string, options: CacheOptionsWithLoader<T>): Promise<T | null>;
  async get<T>(type: Type<T>, key: string, loader: () => Promise<T>): Promise<T>;
  async get<T>(type: Type<T>, key: string, loader: () => Promise<T>, options: CacheOptions): Promise<T>;
  async get<T>(type: Type<T>, key: string, loader: () => Promise<T>, forceRefresh: boolean): Promise<T>;
  async get<T>(type: Type<T>, key: string, loader: () => Promise<T>, forceRefresh: boolean, options: CacheOptions): Promise<T>;
  async get<T>(typeOrKey: Type<T>|string, keyOrLoaderOrOptions?: string|(() => Promise<T>)|CacheOptionsWithLoader<T>, loaderOrOptionsOrForceRefresh?: (() => Promise<T>)|CacheOptions|boolean, optionsOrForceRefresh?: CacheOptions|boolean): Promise<T|null> {

    const { type, key, loader, options, forceRefresh } = {
      type: typeof typeOrKey === 'string' ? null : typeOrKey,
      key: typeof typeOrKey === 'string' ? typeOrKey : typeof keyOrLoaderOrOptions === 'string' ? keyOrLoaderOrOptions : null,
      loader: typeof keyOrLoaderOrOptions === 'function' ? keyOrLoaderOrOptions : typeof loaderOrOptionsOrForceRefresh === 'function' ? loaderOrOptionsOrForceRefresh : null,
      options: (typeof keyOrLoaderOrOptions !== 'undefined' && typeof keyOrLoaderOrOptions !== 'string' && typeof keyOrLoaderOrOptions !== 'function') ? keyOrLoaderOrOptions : (typeof loaderOrOptionsOrForceRefresh !== 'undefined' && typeof loaderOrOptionsOrForceRefresh !== 'boolean' && typeof loaderOrOptionsOrForceRefresh !== 'function') ? loaderOrOptionsOrForceRefresh : (typeof optionsOrForceRefresh !== 'undefined' && typeof optionsOrForceRefresh !== 'boolean') ? optionsOrForceRefresh : null,
      forceRefresh: typeof loaderOrOptionsOrForceRefresh === 'boolean' ? loaderOrOptionsOrForceRefresh : typeof optionsOrForceRefresh === 'boolean' ? optionsOrForceRefresh : null
    }

    if (!key) {
      throw new Error(`[${this.logPrefix}] Invalid argument, required parameter 'key' is missing`);
    }

    if (!this.isReadReady) {
      if (this.verbose) {
        this.logger.info(`[${this.logPrefix}] miss from cache for key ${key}, server is not ready`);
      }
      return loader ? loader() : null;
    }

    if (forceRefresh === true) {
      if (this.verbose) {
        this.logger.info(`[${this.logPrefix}] force refresh requested, flushing key ${key}`);
      }
      await this.flush(key).catch(() => {});
    }

    // Placeholders for expiration policy & ttl
    let itemExpirationPolicy = options?.expirationPolicy || this.defaultExpirationPolicy;
    let itemExpiresInSeconds = options?.expiresInSeconds || this.defaultExpirationInSeconds;
    let itemEncrypted = options?.encrypt || this.defaultEncrypted;

    const reply = await this.withTimeout(() => this.$read(key), this.readTimeout).catch(() => null);
    if (reply) {

      if (this.verbose) {
        this.logger.info(`[${this.logPrefix}] hit from cache for key ${key}`);
      }

      try {
        let result: T;

        const cachedItem = JSON.parse(reply);

        if (isOfType<CacheItem>(cachedItem, '_type', 'CacheItem')) {

          // if there is an expiration policy & duration on the cache item, use it
          itemExpirationPolicy = cachedItem.expirationPolicy || itemExpirationPolicy;
          itemExpiresInSeconds = cachedItem.expiresInSeconds || itemExpiresInSeconds;
          itemEncrypted = cachedItem.encrypt || isOfType<EncryptedCacheItem>(cachedItem, 'encrypted', true) || itemEncrypted;

          // Check if this is an encrypted cache item
          if (isOfType<EncryptedCacheItem>(cachedItem, 'encrypted', true)) {

            if (this.verbose) {
              this.logger.info(`[${this.logPrefix}] cached data for key ${key} has been encrypted, trying to decrypt`);
            }

            // Make sure that we are able to decrypt the data
            if (!this.encryptionManager || !this.encryptionManager.isEncrypted(cachedItem.value)) {
              throw new Error(`[${this.logPrefix}] the retrieved data has been encrypted, but cannot be decrypted as this instance has not been initialized with caching or the retrieved data has been corrupted`);
            }

            if (this.verbose) {
              this.logger.info(`[${this.logPrefix}] decrypting cached data for key ${key}`);
            }

            // Decrypt the data and replace the result with the actual value of the cached item
            result = this.encryptionManager.decrypt(cachedItem.value, cachedItem.salt, cachedItem.nonce);
          } else {
            result = JSON.parse(cachedItem.value);
          }

        } else {
          result = cachedItem;
        }

        if (itemExpirationPolicy === 'expireAfterAccess') {
          if (this.isWriteReady) {
            if (this.verbose) {
              this.logger.info(`[${this.logPrefix}] Refreshing expiration time of ${key}, adding another ${itemExpiresInSeconds} seconds`);
            }
            await this.withTimeout(async () => this.$touch(key, itemExpiresInSeconds), this.writeTimeout).catch(() => {});
          } else {
            if (this.verbose) {
              this.logger.info(`[${this.logPrefix}] Unable to refresh expiration time of ${key}, primary endpoint not available`);
            }
          }
        }

        if (this.verbose) {
          this.logger.info(`[${this.logPrefix}] Returning result for key ${key}`);
        }

        return type ? new type(result) : result;

      } catch (error) {
        if (this.verbose) {
          this.logger.error(`[${this.logPrefix}] An unexpected error occurred while retrieving data for key ${key}`, error);
        }
        await this.flush(key).catch(() => {});
        const result = loader ? loader() : null;
        if (result) {
          await this.set(key, result, {
            expiresInSeconds: itemExpiresInSeconds,
            expirationPolicy: itemExpirationPolicy,
            encrypt: itemEncrypted
          }).catch(() => {});
          return type ? new type(result) : result;
        }
      }
    } else if (loader) {
      try {
        if (this.verbose) {
          this.logger.info(`[${this.logPrefix}] miss from cache for key ${key}, trying to retrieve from loader`);
        }
        const result = await loader();
        if (result) {
          await this.set(key, result, {
            expiresInSeconds: itemExpiresInSeconds,
            expirationPolicy: itemExpirationPolicy,
            encrypt: itemEncrypted
          }).catch(() => {});
          return type ? new type(result) : result;
        }
        if (this.verbose) {
          this.logger.info(`[${this.logPrefix}] miss from loader for key ${key}`);
        }
        return null;
      } catch (error) {
        if (this.verbose) {
          this.logger.error(`[${this.logPrefix}] An unexpected error occurred while retrieving data for key ${key}`, error);
        }
        throw error;
      }
    }

    if (this.verbose) {
      this.logger.info(`[${this.logPrefix}] miss from both cache and loader for key ${key}`);
    }
    return null;
  }

  async set<T>(key: string, data: T, expiresInSeconds: number): Promise<void>;
  async set<T>(key: string, data: T, options?: CacheOptions): Promise<void>;
  async set<T>(key: string, data: T, expiresInSecondsOrOptions?: number|CacheOptions): Promise<void> {
    if (!this.isWriteReady) {
      if (this.verbose) {
        this.logger.error(`[${this.logPrefix}] cannot store data for key ${key}, server is not ready`);
      }
      throw new Error(`[${this.logPrefix}] cannot store data for key ${key}, server is not ready`);
    }

    const options = (typeof expiresInSecondsOrOptions !== 'number' && typeof expiresInSecondsOrOptions !== 'undefined') ? expiresInSecondsOrOptions : null;
    const expiresInSeconds = typeof expiresInSecondsOrOptions === 'number' ? expiresInSecondsOrOptions : options?.expiresInSeconds || this.defaultExpirationInSeconds;
    const expirationPolicy = options?.expirationPolicy || this.defaultExpirationPolicy;
    const encrypt = options?.encrypt || this.defaultEncrypted;

    try {
      let cacheItem: CacheItem|EncryptedCacheItem = {
        value: JSON.stringify(data),
        expiresInSeconds,
        expirationPolicy,
        encrypt,
        _type: 'CacheItem'
      };

      if (this.verbose) {
        this.logger.info(`[${this.logPrefix}] caching data for key ${key} (expires in ${expiresInSeconds} seconds)`);
      }

      // Check if we should be encrypting the data
      if (encrypt && this.encryptionManager && this.salt) {

        if (this.verbose) {
          this.logger.info(`[${this.logPrefix}] encrypting has been enabled for ${key}, encrypting data`);
        }

        // Generate the nonce specifically for this cache item
        const nonce = randomBytes(16)

        // We need to create a wrapper item to ensure we also store the salt & nonce
        cacheItem = {
          ...cacheItem,
          salt: this.salt,
          nonce: nonce.toString('hex'),
          value: this.encryptionManager.encrypt(data, this.salt, nonce),
          encrypted: true
        };
      }

      const payload = JSON.stringify(cacheItem);
      await this.withTimeout(async () => this.$write(key, payload, expiresInSeconds), this.writeTimeout);
    } catch (error) {
      if (this.verbose) {
        this.logger.error(`[${this.logPrefix}] An unexpected error occurred while storing data for key ${key}`, error, data);
      }
      throw error;
    }
  }

  abstract flush(key: string|Array<string>): Promise<void>;
  abstract flushAll(): Promise<void>;

  toCacheKey(...args: Array<string|number|undefined>): string {
    const value = args.filter(item => item !== undefined).join('-');
    const result = createHash('md5').update(value).digest('hex');
    if (this.verbose) {
      this.logger.info(`[${this.logPrefix}] Created cache key '${result}' based on provided arguments '${value}'`);
    }
    return result;
  }

  // Inspiration taken from https://advancedweb.hu/how-to-add-timeout-to-a-promise-in-javascript/
  protected async withTimeout<T>(executor: () => Promise<T>, timeout: number): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    return Promise.race([
      executor(),
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new CacheTimeoutError()), timeout)
      })
    ]).finally(() => clearTimeout(timeoutId));
  }

}

export class CacheTimeoutError extends Error {}
