import { CachingExpirationPolicy, CachingService, Type } from '@collabsoft-net/types';
import { createHash } from 'crypto';
import Memcached from 'memcached';
import { promisify } from 'util';

const DEFAULT_TTL = 30 * 60;

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
  private timeout: number;
  private expirationPolicy: CachingExpirationPolicy;
  private defaultExpirationInSeconds: number;
  private logger: Console;
  private verbose: boolean;

  constructor(options: MemcachedServiceOptions) {
    this.client = new Memcached(options.location, options.memcachedOptions)
    this.timeout = options.memcachedOptions?.timeout || (30 * 1000);

    this.expirationPolicy = options.expirationPolicy || 'expireAfterWrite';
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

    const reply = await this.withTimeout(async () => promisify<string, string>(this.client.get.bind(this.client))(key), this.timeout).catch(() => null);
    if (reply) {
      this.verbose && this.logger.info(`[Memcached] hit from cache for key ${key}`);

      if (this.expirationPolicy === 'expireAfterAccess') {
        this.verbose && this.logger.info(`[Memcached] Refreshing expiration time of ${key}, adding another ${expiresInSeconds} seconds`);
        await this.withTimeout(async () => this.client.touch(key, expiresInSeconds, () => {}), this.timeout).catch(() => {});
      }

      try {
        const result: T = JSON.parse(reply);
        return type ? new type(result) : result;
      } catch (error) {
        this.verbose && this.logger.error(`[Memcached] An unexpected error occurred while retrieving data for key ${key}`, error);
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
        this.verbose && this.logger.error(`[Memcached] An unexpected error occurred while retrieving data for key ${key}`, error);
        return null;
      }
    }

    this.verbose && this.logger.info(`[Memcached] miss from both cache and loader for key ${key}`);
    return null;
  }

  async set<T>(key: string, data: T, expiresInSeconds: number = this.defaultExpirationInSeconds): Promise<Error|null> {
    try {
      const payload = JSON.stringify(data);
      this.verbose && this.logger.info(`[Memcached] caching data for key ${key} (expires in ${expiresInSeconds} seconds)`);
      await this.withTimeout(async () => this.client.set(key, payload, expiresInSeconds, () => {}), this.timeout);
      return null;
    } catch (error) {
      this.verbose && this.logger.error(`[Memcached] An unexpected error occurred while storing data for key ${key}`, error, data);
      return error as Error;
    }
  }

  async flush(key: string|Array<string>): Promise<void> {
    const keys = Array.isArray(key) ? key : [ key ];

    this.verbose && this.logger.info(`[Memcached] flushing key(s) '${keys.join(',')}'`);
    await Promise.all(keys.map((key) => this.withTimeout(() => promisify(this.client.del.bind(this.client))(key), this.timeout)));
  }

  async flushAll() {
    this.verbose && this.logger.info(`[Memcached] flushing all keys`);
    await this.withTimeout(() => promisify(this.client.flush.bind(this.client))(), this.timeout);
  }

  toCacheKey(...args: Array<string|number|undefined>): string {
    const value = args.filter(item => item !== undefined).join('-');
    const result = createHash('md5').update(value).digest('hex');
    this.verbose && this.logger.info(`[Memcached] Created cache key '${result}' based on provided arguments '${value}'`);
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
