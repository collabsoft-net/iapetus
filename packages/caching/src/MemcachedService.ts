import Memcached from 'memcached';
import { serializeError } from 'serialize-error';

import { AbstractCacheService, CacheServiceOptions } from './AbstractCacheService';

const MAX_EXPIRATION = 30 * 24 * 60 * 60

interface MemcachedServiceOptions extends CacheServiceOptions {
  location: Memcached.Location;
  memcachedOptions?: Memcached.options;
}

export class MemcachedService extends AbstractCacheService {
  logPrefix = 'Memcached';

  private client: Memcached;
  private maxExpirationInSeconds: number;

  protected isReadReady: boolean;
  protected isWriteReady: boolean;

  constructor(options: MemcachedServiceOptions) {
    super(options);
    this.client = new Memcached(options.location, options.memcachedOptions)
    this.maxExpirationInSeconds = options.memcachedOptions?.maxExpiration || 10800;
    this.isReadReady = true
    this.isWriteReady = true;
  }

  async has(): Promise<boolean> {
    throw new Error('[Memcached] method `has` is not implemented');
  }

  async flush(key: string|Array<string>): Promise<void> {
    const keys = Array.isArray(key) ? key : [ key ];

    if (this.verbose) {
      this.logger.info(`[Memcached] flushing key(s) '${keys.join(',')}'`);
    }
    await Promise.all(keys.map((entry) => new Promise<void>(resolve => this.client.del(entry, (err) => {
      if (err) {
        if (this.verbose) {
          this.logger.error(`[Memcached] failed to flush ${key}: ${err.message}`, serializeError(err));
        }
      } else {
        if (this.verbose) {
          this.logger.info(`[Memcached] successfully flushed ${key}`);
        }
      }
      resolve();
    }))));
  }

  async flushAll() {
    if (this.verbose) {
      this.logger.info(`[Memcached] flushing all keys`);
    }
    await new Promise<void>(resolve => this.client.flush((err) => {
      if (err) {
        if (this.verbose) {
          this.logger.error(`[Memcached] failed to flush server: ${err.message}`, serializeError(err));
        }
      } else {
        if (this.verbose) {
          this.logger.info(`[Memcached] succesfully flushed server`);
        }
      }
      resolve();
    }));
  }

  protected $read(key: string): Promise<string | null> {
    return new Promise<string|null>(resolve => this.client.get(key, (err, data) => {
      if (err) {
        if (this.verbose) {
          this.logger.error(`[Memcached] failed to retrieve ${key}: ${err.message}`, serializeError(err));
        }
        resolve(null);
      } else {
        if (this.verbose) {
          this.logger.info(`[Memcached] retrieved cached data for key ${key}`);
        }
        resolve(data);
      }
    }));
  }

  protected $write(key: string, data: string, expireInSeconds: number): Promise<void> {
    if (expireInSeconds < MAX_EXPIRATION && expireInSeconds > this.maxExpirationInSeconds) {
      throw new Error('[Memcached] `expiresInSeconds` exceeds maximum expiration time setting');
    }

    const lifetime = expireInSeconds <= MAX_EXPIRATION ? expireInSeconds : Math.floor(new Date().getTime() / 1000) + expireInSeconds;

    return new Promise<void>(resolve => this.client.set(key, data, lifetime, (err, result) => {
      if (err || !result) {
        if (this.verbose) {
          this.logger.error(`[Memcached] failed to set ${key}: ${err.message}`, serializeError(err));
        }
      } else {
        if (this.verbose) {
          this.logger.info(`[Memcached] succesfully set key ${key} ${expireInSeconds <= MAX_EXPIRATION ? `(expires in ${lifetime} seconds)` : `(expires on ${lifetime})`}`);
        }
      }
      resolve();
    }));
  }

  protected async $touch(key: string, expireInSeconds: number): Promise<void> {
    if (expireInSeconds < MAX_EXPIRATION && expireInSeconds > this.maxExpirationInSeconds) {
      throw new Error('[Memcached] `expiresInSeconds` exceeds maximum expiration time setting');
    }

    const lifetime = expireInSeconds <= MAX_EXPIRATION ? expireInSeconds : Math.floor(new Date().getTime() / 1000) + expireInSeconds;

    await new Promise<void>(resolve => this.client.touch(key, lifetime, (err) => {
      if (err) {
        if (this.verbose) {
          this.logger.error(`[Memcached] failed to touch ${key}: ${err.message}`, serializeError(err));
        }
      } else {
        if (this.verbose) {
          this.logger.info(`[Memcached] Updated expiration time of ${key}, ${expireInSeconds <= MAX_EXPIRATION ? `adding another ${lifetime} seconds` : `expires on ${lifetime}`}`);
        }
      }
      resolve();
    }));
  }

  static getIdentifier(): symbol {
    return Symbol.for('RedisService');
  }

}