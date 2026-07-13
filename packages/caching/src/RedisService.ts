import { createClient, RedisClientOptions, RedisClientType, RedisFunctions, RedisModules, RedisScripts, RespVersions, TypeMapping } from 'redis';

import { AbstractCacheService, CacheServiceOptions } from './AbstractCacheService';

interface RedisServiceOptions extends CacheServiceOptions{
  primaryEndpoint: RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;
  readEndpoint?: RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;
}

export class RedisService extends AbstractCacheService {
  protected logPrefix = 'REDIS';

  private primaryEndpoint: RedisClientType<RedisModules, RedisFunctions, RedisScripts, RespVersions, TypeMapping>;
  private readEndpoint: RedisClientType<RedisModules, RedisFunctions, RedisScripts, RespVersions, TypeMapping>;

  constructor(options: RedisServiceOptions) {
    super({
      ...options,
      readTimeout: options.readTimeout || options.readEndpoint?.socket?.connectTimeout || options.primaryEndpoint.socket?.connectTimeout,
      writeTimeout: options.writeTimeout || options.primaryEndpoint.socket?.connectTimeout
    });

    this.primaryEndpoint = createClient(options.primaryEndpoint);
    this.readEndpoint = options.readEndpoint ? createClient(options.readEndpoint) : this.primaryEndpoint;

    this.primaryEndpoint.connect();
    if (options.readEndpoint) {
      this.readEndpoint.connect();
    }
  }

  protected get isReadReady(): boolean {
    return this.readEndpoint.isReady;
  }

  protected get isWriteReady(): boolean {
    return this.primaryEndpoint.isReady;
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

  protected $read(key: string): Promise<string | null> {
    return this.readEndpoint.get(key)
  }

  protected async $write(key: string, data: string, expireInSeconds: number): Promise<void> {
    await this.primaryEndpoint.setEx(key, expireInSeconds, data)
  }

  protected async $touch(key: string, expireInSeconds: number): Promise<void> {
    await this.primaryEndpoint.expire(key, expireInSeconds);
  }

  static getIdentifier(): symbol {
    return Symbol.for('RedisService');
  }

}
