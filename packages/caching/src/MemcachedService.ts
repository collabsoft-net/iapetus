import { CachingExpirationPolicy, CachingService, Type } from '@collabsoft-net/types';
import { createHash } from 'crypto';
import Memcached from 'memcached';
import { serializeError } from 'serialize-error';

const DEFAULT_TTL = 30 * 60;
const MAX_EXPIRATION = 30 * 24 * 60 * 60

interface MemcachedServiceOptions {
  location: Memcached.Location;
  memcachedOptions?: Memcached.options;
  expirationPolicy?: CachingExpirationPolicy;
  defaultExpirationInSeconds?: number;
  logger?: Console;
  verbose?: boolean;
}

export class MemcachedService implements CachingService {

  private client: Memcached;
  private expirationPolicy: CachingExpirationPolicy;
  private maxExpirationInSeconds: number;
  private defaultExpirationInSeconds: number;
  private logger: Console;
  private verbose: boolean;

  constructor(options: MemcachedServiceOptions) {
    this.client = new Memcached(options.location, options.memcachedOptions)
    this.expirationPolicy = options.expirationPolicy || 'expireAfterWrite';
    this.maxExpirationInSeconds = options.memcachedOptions?.maxExpiration || 10800;
    this.defaultExpirationInSeconds = options.defaultExpirationInSeconds || DEFAULT_TTL;
    this.verbose = options.verbose || false;
    this.logger = options.logger || console;
  }

  async has(): Promise<boolean> {
    throw new Error('[Memcached] method `has` is not implemented');
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
      throw new Error('[Memcached] Invalid argument, required parameter `key` is missing');
    }

    if (forceRefresh === true) {
      this.verbose && this.logger.info(`[Memcached] force refresh requested, flushing key ${key}`);
      await this.flush(key).catch(() => {});
    }

    const reply = await new Promise<string|null>(resolve => this.client.get(key, (err, data) => {
      if (err) {
        this.verbose && this.logger.error(`[Memcached] failed to retrieve ${key}: ${err.message}`, serializeError(err));
        resolve(null);
      } else {
        this.verbose && this.logger.info(`[Memcached] retrieved cached data for key ${key}`);
        resolve(data);
      }
    }));

    if (reply) {
      this.verbose && this.logger.info(`[Memcached] hit from cache for key ${key}`);

      if (this.expirationPolicy === 'expireAfterAccess') {

        if (expiresInSeconds < MAX_EXPIRATION && expiresInSeconds > this.maxExpirationInSeconds) {
          throw new Error('`expiresInSeconds` exceeds maximum expiration time setting');
        }

        const lifetime = expiresInSeconds <= MAX_EXPIRATION ? expiresInSeconds : Math.floor(new Date().getTime() / 1000) + expiresInSeconds;
        this.verbose && this.logger.info(`[Memcached] Refreshing expiration time of ${key}, ${expiresInSeconds <= MAX_EXPIRATION ? `adding another ${lifetime} seconds` : `expires on ${lifetime}`}`);

        await new Promise<void>(resolve => this.client.touch(key, lifetime, (err) => {
          if (err) {
            this.verbose && this.logger.error(`[Memcached] failed to touch ${key}: ${err.message}`, serializeError(err));
          } else {
            this.verbose && this.logger.info(`[Memcached] Updated expiration time of ${key}, ${expiresInSeconds <= MAX_EXPIRATION ? `adding another ${lifetime} seconds` : `expires on ${lifetime}`}`);
          }
          resolve();
        }));
      }

      try {
        this.verbose && this.logger.info(`[Memcached] deserialising result for key ${key}`);
        const result: T = JSON.parse(reply);
        this.verbose && this.logger.info(`[Memcached] Returning result for key ${key}`);
        return type ? new type(result) : result as T;
      } catch (error) {
        this.verbose && this.logger.error(`[Memcached] An unexpected error occurred while retrieving data for key ${key}`, serializeError(error));
        await this.flush(key).catch(() => {});
        const result = loader ? loader() : null;
        if (result) {
          await this.set(key, result, expiresInSeconds).catch(() => {});
          return type ? new type(result) : result;
        }
      }
    } else if (loader) {
      try {
        this.verbose && this.logger.info(`[Memcached] miss from cache for key ${key}, trying to retrieve from loader`);
        const result = await loader();
        if (result) {
          await this.set(key, result, expiresInSeconds).catch(() => {});
          return type ? new type(result) : result;
        }
        this.verbose && this.logger.info(`[Memcached] miss from loader for key ${key}`);
        return null;
      } catch (error) {
        this.verbose && this.logger.error(`[Memcached] An unexpected error occurred while retrieving data for key ${key}`, serializeError(error));
        return null;
      }
    }

    this.verbose && this.logger.info(`[Memcached] miss from both cache and loader for key ${key}`);
    return null;
  }

  async set<T>(key: string, data: T, expiresInSeconds: number = this.defaultExpirationInSeconds): Promise<Error|null> {
    try {
      const payload = JSON.stringify(data);

      if (expiresInSeconds < MAX_EXPIRATION && expiresInSeconds > this.maxExpirationInSeconds) {
        throw new Error('`expiresInSeconds` exceeds maximum expiration time setting');
      }

      const lifetime = expiresInSeconds <= MAX_EXPIRATION ? expiresInSeconds : Math.floor(new Date().getTime() / 1000) + expiresInSeconds;
      this.verbose && this.logger.info(`[Memcached] caching data for key ${key} ${expiresInSeconds <= MAX_EXPIRATION ? `(expires in ${lifetime} seconds)` : `(expires on ${lifetime})`}`);

      await new Promise<void>(resolve => this.client.set(key, payload, lifetime, (err, result) => {
        if (err || !result) {
          this.verbose && this.logger.error(`[Memcached] failed to set ${key}: ${err.message}`, serializeError(err));
        } else {
          this.verbose && this.logger.info(`[Memcached] succesfully set key ${key} ${expiresInSeconds <= MAX_EXPIRATION ? `(expires in ${lifetime} seconds)` : `(expires on ${lifetime})`}`);
        }
        resolve();
      }));
      return null;
    } catch (error) {
      this.verbose && this.logger.error(`[Memcached] An unexpected error occurred while storing data for key ${key}`, error, data);
      return error as Error;
    }
  }

  async flush(key: string|Array<string>): Promise<void> {
    const keys = Array.isArray(key) ? key : [ key ];

    this.verbose && this.logger.info(`[Memcached] flushing key(s) '${keys.join(',')}'`);
    await Promise.all(keys.map((entry) => new Promise<void>(resolve => this.client.del(entry, (err) => {
      if (err) {
        this.verbose && this.logger.error(`[Memcached] failed to flush ${key}: ${err.message}`, serializeError(err));
      } else {
        this.verbose && this.logger.info(`[Memcached] successfully flushed ${key}`);
      }
      resolve();
    }))));
  }

  async flushAll() {
    this.verbose && this.logger.info(`[Memcached] flushing all keys`);
    await new Promise<void>(resolve => this.client.flush((err) => {
      if (err) {
        this.verbose && this.logger.error(`[Memcached] failed to flush server: ${err.message}`, serializeError(err));
      } else {
        this.verbose && this.logger.info(`[Memcached] succesfully flushed server`);
      }
      resolve();
    }));
  }

  toCacheKey(...args: Array<string|number|undefined>): string {
    const value = args.filter(item => item !== undefined).join('-');
    const result = createHash('md5').update(value).digest('hex');
    this.verbose && this.logger.info(`[Memcached] Created cache key '${result}' based on provided arguments '${value}'`);
    return result;
  }

  static getIdentifier(): symbol {
    return Symbol.for('RedisService');
  }

}

export class RedisTimeoutError extends Error {}