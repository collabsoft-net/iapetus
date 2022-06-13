import { PageDTO } from '@collabsoft-net/dto';
import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { CachingService, Entity, Paginated, QueryOptions } from '@collabsoft-net/types';
import * as admin from 'firebase-admin';

import { FirebaseAdminRepository } from './FirebaseAdminRepository';
import { QueryBuilder } from './QueryBuilder';

const DEFAULT_CACHE_TIMEOUT_IN_SECONDS = 300;

export class CachedFirebaseAdminRepository extends FirebaseAdminRepository {

  constructor(name: string, private cacheService: CachingService, options?: admin.AppOptions, readOnly?: boolean) {
    super(name, options, readOnly);
  }

  // ==========================================================================

  async findAll(options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<Paginated<Entity>> {
    const cacheKey = this.cacheService.toCacheKey(this.name, options.path);
    const isCached = await this.cacheService.has(cacheKey);

    if (isCached) {
      const cachedEntityIds = await this.cacheService.get<Array<string>>(cacheKey) || [];
      if (cachedEntityIds && Array.isArray(cachedEntityIds) && cachedEntityIds.length > 0) {
        const result = [];
        for await (const entityId of cachedEntityIds.filter(item => !isNullOrEmpty(item))) {
          const entity = await this.findById(entityId, options);
          if (entity) {
            result.push(entity);
          }
        }
        return new PageDTO(result);
      }
    }

    const entities = await super.findAll(options);
    const entityIds = entities.values.map(entity => entity.id);
    await this.cacheService.set(cacheKey, entityIds, options.expiresInSeconds);
    await this.registerQueryBasedCacheKey(cacheKey, options);
    return entities;
  }

  async findAllByProperty(key: string, value: string|number|boolean, options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<Paginated<Entity>> {
    const cacheKey = this.cacheService.toCacheKey(this.name, options.path, key, value);
    const isCached = await this.cacheService.has(cacheKey);

    if (isCached) {
      const cachedEntityIds = await this.cacheService.get<Array<string>>(cacheKey) || [];
      if (cachedEntityIds && Array.isArray(cachedEntityIds) && cachedEntityIds.length > 0) {
        const result = [];
        for await (const entityId of cachedEntityIds.filter(item => !isNullOrEmpty(item))) {
          const entity = await this.findById(entityId, options);
          if (entity) {
            result.push(entity);
          }
        }
        return new PageDTO(result);
      }
    }

    const entities = await super.findAllByProperty(key, value, options);
    const entityIds = entities.values.map(entity => entity.id);
    await this.cacheService.set(cacheKey, entityIds, options.expiresInSeconds);
    await this.registerQueryBasedCacheKey(cacheKey, options);
    return entities;
  }

  async findAllByQuery(qb: QueryBuilder, options: FirebaseAdminQueryOptionsWithCache): Promise<Paginated<Entity>>;
  async findAllByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseAdminQueryOptionsWithCache): Promise<Paginated<Entity>>;
  async findAllByQuery(qb: QueryBuilder|((qb: QueryBuilder) => QueryBuilder), options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<Paginated<Entity>> {
    const queryBuilder = typeof qb === 'function' ? qb(new QueryBuilder) : qb;
    const cacheKey = this.cacheService.toCacheKey(this.name, options.path, ...queryBuilder.conditions.map(item => `${item.key}-${item.operator}-${item.value}`));
    const isCached = await this.cacheService.has(cacheKey);

    if (isCached) {
      const cachedEntityIds = await this.cacheService.get<Array<string>>(cacheKey) || [];
      if (cachedEntityIds && Array.isArray(cachedEntityIds) && cachedEntityIds.length > 0) {
        const result = [];
        for await (const entityId of cachedEntityIds.filter(item => !isNullOrEmpty(item))) {
          const entity = await this.findById(entityId, options);
          if (entity) {
            result.push(entity);
          }
        }
        return new PageDTO(result);
      }
    }

    const entities = await super.findAllByQuery(queryBuilder, options);
    const entityIds = entities.values.map(entity => entity.id);
    await this.cacheService.set(cacheKey, entityIds, options.expiresInSeconds);
    await this.registerQueryBasedCacheKey(cacheKey, options);
    return entities;
  }

  async findById(id: string, options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<Entity|null> {
    return !isNullOrEmpty(id) ? this.cacheService.get<Entity>(this.cacheService.toCacheKey(this.name, options.path, id), () => super.findById(id, options)) : null;
  }

  async findByProperty(key: string, value: string|number|boolean, options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<Entity|null> {
    const cacheKey = this.cacheService.toCacheKey(this.name, options.path, key, value);
    const isCached = await this.cacheService.has(cacheKey);

    if (isCached) {
      const cachedEntityId = await this.cacheService.get<string>(cacheKey);
      if (cachedEntityId && typeof cachedEntityId === 'string' && !isNullOrEmpty(cachedEntityId)) {
        return this.findById(cachedEntityId, options);
      }
    }

    const entity = await super.findByProperty(key, value, options);
    if (entity) {
      await this.cacheService.set(this.cacheService.toCacheKey(this.name, options.path, entity.id), entity, options.expiresInSeconds);
      await this.cacheService.set(cacheKey, entity.id, options.expiresInSeconds);
      await this.registerQueryBasedCacheKey(cacheKey, options);
    }

    return entity;
  }

  async findByQuery(qb: QueryBuilder, options: FirebaseAdminQueryOptionsWithCache): Promise<Entity|null>;
  async findByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseAdminQueryOptionsWithCache): Promise<Entity|null>;
  async findByQuery(qb: QueryBuilder|((qb: QueryBuilder) => QueryBuilder), options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<Entity|null> {
    const queryBuilder = typeof qb === 'function' ? qb(new QueryBuilder) : qb;
    const cacheKey = this.cacheService.toCacheKey(this.name, options.path, ...queryBuilder.conditions.map(item => `${item.key}-${item.operator}-${item.value}`));
    const isCached = await this.cacheService.has(cacheKey);

    if (isCached) {
      const cachedEntityId = await this.cacheService.get<string>(cacheKey);
      if (cachedEntityId && typeof cachedEntityId === 'string' && !isNullOrEmpty(cachedEntityId)) {
        return this.findById(cachedEntityId, options);
      }
    }

    const entity = await super.findByQuery(queryBuilder, options);
    if (entity) {
      await this.cacheService.set(this.cacheService.toCacheKey(this.name, options.path, entity.id), entity, options.expiresInSeconds);
      await this.cacheService.set(cacheKey, entity.id, options.expiresInSeconds);
      await this.registerQueryBasedCacheKey(cacheKey, options);
    }

    return entity;
  }

  async save(entity: Entity, options: FirebaseAdminQueryOptionsWithCache = { path: '/', expiresInSeconds: DEFAULT_CACHE_TIMEOUT_IN_SECONDS }): Promise<Entity> {
    const result = await super.save(entity, options);
    await this.cacheService.set(this.cacheService.toCacheKey(this.name, options.path, result.id), result, options.expiresInSeconds);
    await this.flushQueryBasedCacheKeys(options);
    return result;
  }

  async deleteAll(options: FirebaseAdminQueryOptionsWithCache): Promise<void>;
  async deleteAll(entities: Array<Entity>, options?: FirebaseAdminQueryOptionsWithCache): Promise<void>;
  async deleteAll(entities: Array<Entity>|FirebaseAdminQueryOptionsWithCache, options?: FirebaseAdminQueryOptionsWithCache): Promise<void> {
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
      await this.cacheService.flush(queryBasedCacheKeys);
    } catch (err) {
      // We can ignore this
    }
  }

}

export interface FirebaseAdminQueryOptionsWithCache extends QueryOptions {
  path: string;
  expiresInSeconds: number;
}