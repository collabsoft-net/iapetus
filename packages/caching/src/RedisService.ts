import { CachingExpirationPolicy, CachingService, Type } from '@collabsoft-net/types';
import { createHash } from 'crypto';
import { createClient, RedisClientOptions, RedisClientType, RedisFunctions, RedisModules, RedisScripts } from 'redis';

const DEFAULT_TTL = 30 * 60;

interface RedisServiceOptions {
  primaryEndpoint: RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;
  readEndpoint?: RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;
  expirationPolicy?: CachingExpirationPolicy;
  defaultExpirationInSeconds?: number;
  verbose?: boolean;
}

export class RedisService implements CachingService {

  private primaryEndpoint: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
  private writeTimeout: number;

  private readEndpoint: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
  private readTimeout: number;

  private expirationPolicy: CachingExpirationPolicy;
  private defaultExpirationInSeconds: number;
  private verbose: boolean;

  constructor(options: RedisServiceOptions) {
    this.primaryEndpoint = createClient(options.primaryEndpoint);
    this.writeTimeout = options.primaryEndpoint.socket?.connectTimeout || (30 * 1000);

    this.readEndpoint = options.readEndpoint ? createClient(options.readEndpoint) : this.primaryEndpoint;
    this.readTimeout = options.readEndpoint?.socket?.connectTimeout || options.primaryEndpoint.socket?.connectTimeout || (30 * 1000);

    this.expirationPolicy = options.expirationPolicy || 'expireAfterWrite';
    this.defaultExpirationInSeconds = options.defaultExpirationInSeconds || DEFAULT_TTL;
    this.verbose = options.verbose || false;

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
    this.verbose && console.info(result > 0 ? `[REDIS] ${key} exists in cache` : `[REDIS] ${key} does not exist in cache`);
    return result > 0;
  }

  async get<T>(key: string): Promise<T|null>;
  async get<T>(key: string, loader: () => Promise<T|null>, forceRefresh?: boolean): Promise<T|null>;
  async get<T>(key: string, loader: () => Promise<T|null>, expiresInSeconds?: number, forceRefresh?: boolean): Promise<T|null>;
  async get<T>(type: Type<T>, key: string): Promise<T|null>;
  async get<T>(type: Type<T>, key: string, loader: () => Promise<T|null>, forceRefresh?: boolean): Promise<T|null>;
  async get<T>(type: Type<T>, key: string, loader: () => Promise<T|null>, expiresInSeconds?: number, forceRefresh?: boolean): Promise<T|null>;
  async get<T>(typeOrKey: Type<T>|string, keyOrLoader?: string|(() => Promise<T|null>), loaderOrDurationOrForceRefresh?: number|boolean|(() => Promise<T|null>), durationOrForceRefresh?: number|boolean, forced?: boolean): Promise<T|null> {

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
      this.verbose && console.info(`[REDIS] miss from cache for key ${key}, server is not ready`);
      return loader ? loader() : null;
    }

    if (forceRefresh === true) {
      this.verbose && console.info(`[REDIS] force refresh requested, flushing key ${key}`);
      await this.flush(key).catch(() => {});
    }

    const reply = await this.withTimeout(async () => this.readEndpoint.get(key), this.readTimeout).catch(() => null);
    if (reply) {
      this.verbose && console.info(`[REDIS] hit from cache for key ${key}`);

      if (this.expirationPolicy === 'expireAfterAccess') {
        if (this.primaryEndpoint.isReady) {
          this.verbose && console.info(`[REDIS] Refreshing expiration time of ${key}, adding another ${expiresInSeconds} seconds`);
          await this.withTimeout(async () => this.primaryEndpoint.expire(key, expiresInSeconds), this.writeTimeout).catch(() => {});
        } else {
          this.verbose && console.info(`[REDIS] Unable to refresh expiration time of ${key}, primary endpoint not available`);
        }
      }

      try {
        const result: T = JSON.parse(reply);
        return type ? new type(result) : result;
      } catch (error) {
        this.verbose && console.error(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
        await this.flush(key).catch(() => {});
        const result = loader ? loader() : null;
        if (result) {
          await this.set(key, result, expiresInSeconds).catch(() => {});
          return type ? new type(result) : result;
        }
      }
    } else if (loader) {
      try {
        this.verbose && console.info(`[REDIS] miss from cache for key ${key}, trying to retrieve from loader`);
        const result = await loader();
        if (result) {
          await this.set(key, result, expiresInSeconds).catch(() => {});
          return type ? new type(result) : result;
        }
        this.verbose && console.info(`[REDIS] miss from loader for key ${key}`);
        return null;
      } catch (error) {
        this.verbose && console.error(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
        return null;
      }
    }

    this.verbose && console.info(`[REDIS] miss from both cache and loader for key ${key}`);
    return null;
  }

  async set<T>(key: string, data: T, expiresInSeconds: number = this.defaultExpirationInSeconds): Promise<Error|null> {
    if (!this.primaryEndpoint.isReady) {
      this.verbose && console.error(`[REDIS] cannot store data for key ${key}, server is not ready`);
      return new Error(`[REDIS] cannot store data for key ${key}, server is not ready`);
    }

    try {
      const payload = JSON.stringify(data);
      this.verbose && console.info(`[REDIS] caching data for key ${key} (expires in ${expiresInSeconds} seconds)`);
      await this.withTimeout(async () => this.primaryEndpoint.setEx(key, expiresInSeconds, payload), this.writeTimeout);
      return null;
    } catch (error) {
      this.verbose && console.error(`[REDIS] An unexpected error occurred while storing data for key ${key}`, error, data);
      return error as Error;
    }
  }

  async flush(key: string|Array<string>): Promise<void> {
    const keys = Array.isArray(key) ? key : [ key ];

    if (!this.primaryEndpoint.isReady) {
      this.verbose && console.info(`[REDIS] cannot flush key(s) '${keys.join(',')}', server is not ready`);
    } else {
      this.verbose && console.info(`[REDIS] flushing key(s) '${keys.join(',')}'`);
      await this.withTimeout(() => this.primaryEndpoint.unlink(keys), this.writeTimeout);
    }
  }

  async flushAll() {
    if (!this.primaryEndpoint.isReady) {
      this.verbose && console.info(`[REDIS] cannot flush, server is not ready`);
    } else {
      this.verbose && console.info(`[REDIS] flushing all keys`);
      await this.withTimeout(() => this.primaryEndpoint.flushAll(), this.writeTimeout);
    }
  }

  toCacheKey(...args: Array<string|number|undefined>): string {
    const value = args.filter(item => item !== undefined).join('-');
    const result = createHash('md5').update(value).digest('hex');
    this.verbose && console.info(`[REDIS] Created cache key '${result}' based on provided arguments '${value}'`);
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
