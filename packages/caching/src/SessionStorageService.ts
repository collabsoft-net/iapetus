import { CachingService, Type } from '@collabsoft-net/types';
import { createHash } from 'crypto';
import expirePlugin from 'store/plugins/expire';
import engine from 'store/src/store-engine';
import memoryStorage from 'store/storages/memoryStorage';
import sessionStorage from 'store/storages/sessionStorage';

const store = engine.createStore([ sessionStorage, memoryStorage ], [ expirePlugin ]);

interface StoreWithExpire {
  set: (key: string, value: string, expiresInSeconds: number) => void;
}

export class SessionStorageService implements CachingService {

  constructor(private isTimeBased?: boolean) {}

  async has(key: string|Array<string>): Promise<boolean> {
    const keys = Array.isArray(key) ? key : [ key ];
    return keys.every(item => store.get(item) !== 'undefined');
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
      expiresInSeconds: typeof loaderOrDurationOrForceRefresh === 'number' ? loaderOrDurationOrForceRefresh : typeof durationOrForceRefresh === 'number' ? durationOrForceRefresh : undefined,
      forceRefresh: typeof loaderOrDurationOrForceRefresh === 'boolean' ? loaderOrDurationOrForceRefresh : typeof durationOrForceRefresh === 'boolean' ? durationOrForceRefresh : typeof forced === 'boolean' ? forced : null
    }

    if (!key) {
      throw new Error('[CACHE] Invalid argument, required parameter `key` is missing');
    }

    if (forceRefresh === true) {
      await this.flush(key);
    }

    const reply = store.get(key);
    if (reply) {
      try {
        console.log(`[CACHE] hit from cache for key ${key}`);
        const result: T = JSON.parse(reply);
        return type ? new type(result) : result;
      } catch (error) {
        console.log(`[CACHE] An unexpected error occurred while retrieving data for key ${key}`, error);
        await this.flush(key);
        const result = loader ? loader() : null;
        if (result) {
          return type ? new type(result) : result;
        }
      }
    } else if (loader) {
      try {
        console.log(`[CACHE] miss from cache for key ${key}, trying to retrieve from loader`);
        const result = await loader();
        if (result) {
          await this.set(key, result, expiresInSeconds);
          return type ? new type(result) : result;
        }
        console.log(`[CACHE] miss from loader for key ${key}`);
        return null;
      } catch (error) {
        console.log(`[CACHE] An unexpected error occurred while retrieving data for key ${key}`, error);
        return null;
      }
    }

    return null;
  }

  async set<T>(key: string, data: T, expiresInSeconds?: number): Promise<Error|null> {
    console.log(`[CACHE] caching data for key ${key} (expires in ${expiresInSeconds} seconds)`);
    try {
      const payload = JSON.stringify(data);
      if (expiresInSeconds) {
        (store as StoreWithExpire).set(key, payload, new Date().getTime() + expiresInSeconds * 1000);
      } else if (!this.isTimeBased) {
        store.set(key, payload);
      }
      return null;
    } catch (error) {
      console.error(`[CACHE] An unexpected error occurred while storing data for key ${key}`, error, data);
      return error as Error;
    }
  }

  async flush(key: string|Array<string>): Promise<void> {
    console.log(`[CACHE] flushing key ${key}`);
    const keys = Array.isArray(key) ? key : [ key ];
    keys.forEach(item => store.remove(item));
  }

  async flushAll() {
    store.clearAll();
  }

  toCacheKey(...args: Array<string|number|undefined>): string {
    return createHash('md5').update(args.filter(item => item !== undefined).join('-')).digest('hex');
  }

  static getIdentifier(): symbol {
    return Symbol.for('BrowserService');
  }

}