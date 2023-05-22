import { CachingExpirationPolicy, CachingService, Type } from '@collabsoft-net/types';
import { createHash } from 'crypto';
import { createClient, RedisClientOptions, RedisClientType, RedisFunctions, RedisModules, RedisScripts } from 'redis';

const DEFAULT_TTL = 30 * 60;

export class RedisService implements CachingService {

  private client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
  private ready = false;

  constructor(options: RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>, private verbose: boolean = false, private expirationPolicy: CachingExpirationPolicy = 'expireAfterWrite') {
    this.client = createClient(options);
    this.client.on('ready', () => { this.ready = true; });
    this.client.on('error', () => { this.ready = false; });
  }

  async has(key: string|Array<string>): Promise<boolean> {
    await this.isReady();
    const result = await this.client.exists(key);
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
      expiresInSeconds: typeof durationOrForceRefresh === 'number' ? durationOrForceRefresh : DEFAULT_TTL,
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
      await this.flush(key);
    }

    const reply = await this.client.get(key);
    if (reply) {
      try {
        this.verbose && console.info(`[REDIS] hit from cache for key ${key}`);
        const result: T = JSON.parse(reply);
        return type ? new type(result) : result;
      } catch (error) {
        this.verbose && console.info(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
        await this.flush(key);
        const result = loader ? loader() : null;
        if (result) {
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
        this.verbose && console.info(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
        return null;
      }
    }

    if (this.expirationPolicy === 'expireAfterAccess') {
      await this.client.expire(key, expiresInSeconds);
    }

    return null;
  }

  async set<T>(key: string, data: T, expiresInSeconds: number = DEFAULT_TTL): Promise<Error|null> {
    await this.isReady();

    if (!this.ready) {
      console.error(`[REDIS] cannot store data for key ${key}, server is not ready`);
      return new Error(`[REDIS] cannot store data for key ${key}, server is not ready`);
    }

    this.verbose && console.info(`[REDIS] caching data for key ${key} (expires in ${expiresInSeconds} seconds)`);
    try {
      const payload = JSON.stringify(data);
      await this.client.setEx(key, expiresInSeconds, payload);
      return null;
    } catch (error) {
      this.verbose && console.error(`[REDIS] An unexpected error occurred while storing data for key ${key}`, error, data);
      return error as Error;
    }
  }

  async flush(key: string|Array<string>): Promise<void> {
    await this.isReady();
    if (!this.ready) {
      this.verbose && console.info(`[REDIS] cannot flush key ${key}, server is not ready`);
    } else {
      this.verbose && console.info(`[REDIS] flushing key ${key}`);
      await this.client.unlink(key);
    }
  }

  async flushAll() {
    await this.isReady();
    if (!this.ready) {
      this.verbose && console.info(`[REDIS] cannot flush, server is not ready`);
    } else {
      await this.client.flushAll();
    }
  }

  toCacheKey(...args: Array<string|number|undefined>): string {
    return createHash('md5').update(args.filter(item => item !== undefined).join('-')).digest('hex');
  }

  private async isReady() {
    if (this.ready) {
      return;
    } else {
      try {
        await this.client.connect();
      } catch (error) {
        this.ready = false;
        return;
      }

      return new Promise<void>(resolve => {
        let count = 0;
        const interval = setInterval(() => {
          count++;
          if (this.ready || count >= 5) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }
  }

  static getIdentifier(): symbol {
    return Symbol.for('RedisService');
  }

}