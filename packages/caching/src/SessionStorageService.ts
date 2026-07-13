import expirePlugin from 'store/plugins/expire';
import engine from 'store/src/store-engine';
import memoryStorage from 'store/storages/memoryStorage';
import sessionStorage from 'store/storages/sessionStorage';

import { AbstractCacheService, CacheServiceOptions } from './AbstractCacheService';

const store = engine.createStore([ sessionStorage, memoryStorage ], [ expirePlugin ]);

interface StoreWithExpire {
  set: (key: string, value: string, expiresInSeconds: number) => void;
}

export class SessionStorageService extends AbstractCacheService {

  protected logPrefix = 'CACHE';
  protected isReadReady = true;
  protected isWriteReady = true;

  constructor(options: CacheServiceOptions) {
    super(options);
  }

  async has(key: string|Array<string>): Promise<boolean> {
    const keys = Array.isArray(key) ? key : [ key ];
    return keys.every(item => store.get(item) !== 'undefined');
  }

  async flush(key: string|Array<string>): Promise<void> {
    console.log(`[CACHE] flushing key ${key}`);
    const keys = Array.isArray(key) ? key : [ key ];
    keys.forEach(item => store.remove(item));
  }

  async flushAll() {
    store.clearAll();
  }

 protected async $read(key: string): Promise<string | null> {
    return store.get(key);
  }

  protected async $write(key: string, data: string, expireInSeconds: number): Promise<void> {
    (store as StoreWithExpire).set(key, data, new Date().getTime() + expireInSeconds * 1000);
  }

  protected async $touch(key: string, expireInSeconds: number): Promise<void> {
    const result = await this.$read(key);
    if (result) {
      await this.$write(key, result, expireInSeconds);
    }
  }

  static getIdentifier(): symbol {
    return Symbol.for('SessionStorageService');
  }

}