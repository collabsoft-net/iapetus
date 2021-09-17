import { Type } from '@collabsoft-net/types';
import { createHash } from 'crypto';
import { ClientOpts, createClient, RedisClient } from 'redis';

export class RedisService {

  private client: RedisClient;
  private ready = false;
  private timeout = false;

  constructor(options: ClientOpts) {
    this.client = createClient(options);
    this.client.on('ready', () => { this.ready = true; });
    this.client.on('error', () => { this.timeout = true; });
  }

  public async get<T>(type: Type<T>, key: string, loader: () => Promise<T|null>, forceRefresh?: boolean): Promise<T|null> {
    await this.isReady();
    if (!this.ready) {
      console.log(`[REDIS] miss from cache for key ${key}, server is not ready`);
      return loader();
    }

    if (forceRefresh === true) {
      console.log(`[REDIS] forcing reload of key ${key}`);
      await new Promise(resolve => this.client.del(key, resolve));
    }

    return new Promise<T|null>(resolve =>
      this.client.get(key, async (_, reply) => {
          if (reply) {
            try {
              console.log(`[REDIS] hit from cache for key ${key}`);
              const result: T = JSON.parse(reply);
              resolve(new type(result));
            } catch (error) {
              console.log(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
              this.client.del(key, async () => {
                const result = await loader();
                resolve(new type(result));
              });
            }
          } else {
            try {
              console.log(`[REDIS] miss from cache for key ${key}`);
              const result = await loader();
              if (result === null) throw new Error(`Failed to retrieve data from loader`);

              await this.set(key, result);
              resolve(new type(result));
            } catch (error) {
              console.log(`[REDIS] An unexpected error occurred while retrieving data for key ${key}`, error);
              resolve(null);
            }
          }
      }));
  }

  public async set<T>(key: string, data: T): Promise<Error|null> {
    await this.isReady();
    if (!this.ready) {
      console.error(`[REDIS] cannot store data for key ${key}, server is not ready`);
      return new Error(`[REDIS] cannot store data for key ${key}, server is not ready`);
    }

    console.log(`[REDIS] caching data for key ${key}`);
    return new Promise<Error|null>(resolve => {
      try {
        const payload = JSON.stringify(data);
        this.client.setex(key, 30 * 60 * 1000, payload, resolve);
      } catch (error) {
        console.error(`[REDIS] An unexpected error occurred while storing data for key ${key}`, error, data);
        resolve(error as Error);
      }
    });
  }

  public static generateKey(...args: Array<string|number|undefined>): string {
    return createHash('md5').update(args.filter(item => item !== undefined).join('-')).digest('hex');
  }

  private async isReady() {
    if (this.ready || this.timeout) {
      return;
    } else {
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