import { CachingExpirationPolicy, CachingService, Type } from '@collabsoft-net/types';
import { createHash } from 'crypto';
import { createClient, RedisClientOptions, RedisClientType, RedisFunctions, RedisModules, RedisScripts } from 'redis';

const DEFAULT_TTL = 30 * 60;

export class RedisService implements CachingService {

  private client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
  private timeout: number;
  private ready = false;
  private unavailable = false;

  constructor(options: RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>, private expirationPolicy: CachingExpirationPolicy = 'expireAfterWrite', private defaultExpirationInSeconds = DEFAULT_TTL, private verbose: boolean = false) {
    this.client = createClient(options);
    this.timeout = options.socket?.connectTimeout || (30 * 1000);
    this.client.on('ready', () => { this.ready = true; });
    this.client.on('error', () => { this.ready = false; });
  }

  async has(key: string|Array<string>): Promise<boolean> {
    await this.isReady();
    if (!this.ready) {
      throw new Error('[REDIS] Server is not ready for connection, cannot determine if cache key exists');
    }

    const result = await this.client.exists(key);
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
    await this.isReady();

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

    if (!this.ready) {
      this.verbose && console.info(`[REDIS] miss from cache for key ${key}, server is not ready`);
      return loader ? loader() : null;
    }

    if (forceRefresh === true) {
      this.verbose && console.info(`[REDIS] force refresh requested, flushing key ${key}`);
      await this.flush(key);
    }

    const reply = await this.client.get(key);
    if (reply) {
      this.verbose && console.info(`[REDIS] hit from cache for key ${key}`);

      if (this.expirationPolicy === 'expireAfterAccess') {
        this.verbose && console.info(`[REDIS] Refreshing expiration time of ${key}, adding another ${expiresInSeconds} seconds`);
        await this.client.expire(key, expiresInSeconds);
      }

      try {
        const result: T = JSON.parse(reply);
        return type ? new type(result) : result;
      } catch (error) {
        this.verbose && console.error(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
        await this.flush(key);
        const result = loader ? loader() : null;
        if (result) {
          await this.set(key, result, expiresInSeconds);
          return type ? new type(result) : result;
        }
      }
    } else if (loader) {
      try {
        this.verbose && console.info(`[REDIS] miss from cache for key ${key}, trying to retrieve from loader`);
        const result = await loader();
        if (result) {
          await this.set(key, result, expiresInSeconds);
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
    await this.isReady();

    if (!this.ready) {
      this.verbose && console.error(`[REDIS] cannot store data for key ${key}, server is not ready`);
      return new Error(`[REDIS] cannot store data for key ${key}, server is not ready`);
    }

    try {
      const payload = JSON.stringify(data);
      this.verbose && console.info(`[REDIS] caching data for key ${key} (expires in ${expiresInSeconds} seconds)`);
      await this.client.setEx(key, expiresInSeconds, payload);
      return null;
    } catch (error) {
      this.verbose && console.error(`[REDIS] An unexpected error occurred while storing data for key ${key}`, error, data);
      return error as Error;
    }
  }

  async flush(key: string|Array<string>): Promise<void> {
    const keys = Array.isArray(key) ? key : [ key ];

    await this.isReady();
    if (!this.ready) {
      this.verbose && console.info(`[REDIS] cannot flush key(s) '${keys.join(',')}', server is not ready`);
    } else {
      this.verbose && console.info(`[REDIS] flushing key(s) '${keys.join(',')}'`);
      await this.client.unlink(keys);
    }
  }

  async flushAll() {
    await this.isReady();
    if (!this.ready) {
      this.verbose && console.info(`[REDIS] cannot flush, server is not ready`);
    } else {
      this.verbose && console.info(`[REDIS] flushing all keys`);
      await this.client.flushAll();
    }
  }

  toCacheKey(...args: Array<string|number|undefined>): string {
    const value = args.filter(item => item !== undefined).join('-');
    const result = createHash('md5').update(value).digest('hex');
    this.verbose && console.info(`[REDIS] Created cache key '${result}' based on provided arguments '${value}'`);
    return result;
  }

  // We are building in a default timeout of 30 seconds
  // If we cannot establish a connection within that timeframe, we're going to abort
  // This is specifically because of use in GCP Firebase Cloud Functions
  // Firebase uses a CDN which has a timeout of 60s, despite allowing Cloud Functions to run for 5m
  // The CDN will return 503 if the cloud function does not respond in time
  // The 30s timeout is to allow for fetching data from source before hitting the Cloud Function timeout
  private async isReady() {
    if (this.ready || this.unavailable) {
      return;
    } else {
      return new Promise<void>(resolve => {
        let count = 0;

        // Start connecting with the client
        this.client.connect().then(() => {
          this.ready = true;
          this.unavailable = false;
        }).catch(() => {
          this.ready = false;
          this.unavailable = true;
        });

        const maxCount = this.timeout / 1000;
        const interval = setInterval(() => {
          count++;
          if (this.unavailable || this.ready || count >= maxCount) {
            clearInterval(interval);
            resolve();
          }
        }, 1000);
      });
    }
  }

  static getIdentifier(): symbol {
    return Symbol.for('RedisService');
  }

}