import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { CachingService, Entity, Paginated, QueryOptions } from '@collabsoft-net/types';
import { AppOptions } from 'firebase-admin';

import { FirebaseAdminRepository } from './FirebaseAdminRepository';
import { QueryBuilder } from './QueryBuilder';

const DEFAULT_CACHE_TIMEOUT_IN_SECONDS = 300;

export class CachedFirebaseAdminRepository extends FirebaseAdminRepository {

  constructor(name: string, private cacheService: CachingService, options?: AppOptions, readOnly?: boolean) {
    super(name, options, readOnly);
  }

  // ==========================================================================

  async findAll<T extends Entity>(options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<Paginated<T>> {
    const cacheKey = this.cacheService.toCacheKey(this.name, options.path);
    const result = await this.cacheService.get<Paginated<T>>(cacheKey, () => super.findAll(options), options.expiresInSeconds);

    if (result) {
      await this.registerQueryBasedCacheKey(cacheKey, options);
      return result;
    } else {
      return super.findAll(options);
    }
  }

  async findAllByQuery<T extends Entity>(qb: QueryBuilder, options: FirebaseAdminQueryOptionsWithCache): Promise<Paginated<T>>;
  async findAllByQuery<T extends Entity>(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseAdminQueryOptionsWithCache): Promise<Paginated<T>>;
  async findAllByQuery<T extends Entity>(qb: QueryBuilder|((qb: QueryBuilder) => QueryBuilder), options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<Paginated<T>> {
    const queryBuilder = typeof qb === 'function' ? qb(new QueryBuilder) : qb;
    const cacheKey = this.cacheService.toCacheKey(this.name, options.path, ...queryBuilder.conditions.map(item => `${item.key}-${item.operator}-${item.value}`));
    const result = await this.cacheService.get<Paginated<T>>(cacheKey, () => super.findAllByQuery(queryBuilder, options), options.expiresInSeconds);

    if (result) {
      await this.registerQueryBasedCacheKey(cacheKey, options);
      return result;
    } else {
      return super.findAllByQuery(queryBuilder, options);
    }
  }

  async findById<T extends Entity>(id: string, options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<T|null> {
    return !isNullOrEmpty(id) ? this.cacheService.get<T>(this.cacheService.toCacheKey(this.name, options.path, id), () => super.findById(id, options)) : null;
  }

  async save<T extends Entity>(entity: T, options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<T> {
    const result = await super.save(entity, options);
    await this.cacheService.set(this.cacheService.toCacheKey(this.name, options.path, result.id), result, options.expiresInSeconds);
    await this.flushQueryBasedCacheKeys(options);
    return result;
  }

  async deleteAll(options: FirebaseAdminQueryOptionsWithCache): Promise<void>;
  async deleteAll<T extends Entity>(entities: Array<T>, options?: FirebaseAdminQueryOptionsWithCache): Promise<void>;
  async deleteAll<T extends Entity>(entities: Array<T>|FirebaseAdminQueryOptionsWithCache, options?: FirebaseAdminQueryOptionsWithCache): Promise<void> {
    if (Array.isArray(entities)) {
      await super.deleteAll(entities, options);
    } else {
      await super.deleteAll(entities);
      await this.cacheService.flushAll();
    }
  }

  async deleteById(id: string, options: FirebaseAdminQueryOptionsWithCache): Promise<void> {
    await super.deleteById(id, options);
    await this.cacheService.flush(this.cacheService.toCacheKey(this.name, options.path, id));
    await this.flushQueryBasedCacheKeys(options);
  }

  private async registerQueryBasedCacheKey(key: string, options: FirebaseAdminQueryOptionsWithCache) {
    const cacheKey = this.cacheService.toCacheKey(this.name, options.path, 'QueryBasedCacheKeys');
    const result = await this.cacheService.get<Array<string>>(cacheKey) || [];
    if (!result.includes(key)) {
      const queryBasedCacheKeys = new Set<string>(result);
      queryBasedCacheKeys.add(key);
      await this.cacheService.set(cacheKey, Array.from(queryBasedCacheKeys), 365 * 24 * 60 * 60);
    }
  }

  private async flushQueryBasedCacheKeys(options: FirebaseAdminQueryOptionsWithCache) {
    try {
      const cacheKey = this.cacheService.toCacheKey(this.name, options.path, 'QueryBasedCacheKeys');
      const queryBasedCacheKeys = await this.cacheService.get<Array<string>>(cacheKey) || [];
      await this.cacheService.flush([ cacheKey, ...queryBasedCacheKeys ]);
    } catch (err) {
      // We can ignore this
    }
  }

}

export interface FirebaseAdminQueryOptionsWithCache extends QueryOptions {
  path: string;
  expiresInSeconds: number;
}