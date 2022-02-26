import { Type } from '@collabsoft-net/types';
import { createHash } from 'crypto';
import { createClient, RedisClientOptions, RedisClientType, RedisModules, RedisScripts } from 'redis';

export class RedisService {

  private client: RedisClientType<RedisModules, RedisScripts>;
  private ready = false;

  constructor(options: RedisClientOptions<RedisModules, RedisScripts>) {
    this.client = createClient(options);
    this.client.on('ready', () => { this.ready = true; });
    this.client.on('error', () => { this.ready = false; });
  }

  public async get<T>(type: Type<T>, key: string, loader: () => Promise<T|null>, forceRefresh?: boolean): Promise<T|null> {
    await this.isReady();
    if (!this.ready) {
      console.log(`[REDIS] miss from cache for key ${key}, server is not ready`);
      return loader();
    }

    if (forceRefresh === true) {
      await this.flush(key);
    }

    const reply = await this.client.get(key);
    if (reply) {
      try {
        console.log(`[REDIS] hit from cache for key ${key}`);
        const result: T = JSON.parse(reply);
        return new type(result);
      } catch (error) {
        console.log(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
        await this.flush(key);
        const result = await loader();
        return new type(result);
      }
    } else {
      try {
        console.log(`[REDIS] miss from cache for key ${key}, trying to retrieve from loader`);
        const result = await loader();
        if (result) {
          await this.set(key, result);
          return new type(result);
        }
        console.log(`[REDIS] miss from loader for key ${key}`);
        return null;
      } catch (error) {
        console.log(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
        return null;
      }
    }
  }

  public async set<T>(key: string, data: T, expiresInSeconds: number = 30 * 60): Promise<Error|null> {
    await this.isReady();
    if (!this.ready) {
      console.error(`[REDIS] cannot store data for key ${key}, server is not ready`);
      return new Error(`[REDIS] cannot store data for key ${key}, server is not ready`);
    }

    console.log(`[REDIS] caching data for key ${key} (expires in ${expiresInSeconds} seconds)`);
    try {
      const payload = JSON.stringify(data);
      await this.client.setEx(key, expiresInSeconds, payload);
      return null;
    } catch (error) {
      console.error(`[REDIS] An unexpected error occurred while storing data for key ${key}`, error, data);
      return error as Error;
    }
  }

  public async flush(key: string): Promise<void> {
    await this.isReady();
    if (!this.ready) {
      console.log(`[REDIS] cannot flush key ${key}, server is not ready`);
    } else {
      console.log(`[REDIS] flushing key ${key}`);
      await this.client.del(key);
    }
  }

  public static generateKey(...args: Array<string|number|undefined>): string {
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

}