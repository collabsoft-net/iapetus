
import { MemoryEmitter } from '@collabsoft-net/emitters';
import { isOfType } from '@collabsoft-net/helpers';
import { Entity, Event, EventListener, Paginated, QueryBuilder, QueryOptions, Repository, StorageProvider, User } from '@collabsoft-net/types';
import { kvs } from '@forge/kvs';
import uniqid from 'uniqid';

import { QueryBuilder as QB } from '../QueryBuilder';

type KeyValueStoreObject = Array<unknown> | boolean | number | object | string;

export class ForgeRepository<T extends Entity> implements Repository<T> {

  private emitter: MemoryEmitter = new MemoryEmitter();

  constructor(protected name: string, protected readOnly?: boolean) {
    this.readOnly = readOnly;
  }

  async on(event: typeof Event|string, listener: EventListener): Promise<void> {
    return this.emitter.on(event, listener);
  }

  async emit(event: Event): Promise<void> {
    return this.emitter.emit(event);
  }

  async close(): Promise<void> {
    throw new Error('This feature is not supported in Forge');
  }

  get storage(): StorageProvider {
    throw new Error('This feature is not supported in Forge');
  }

  // ==========================================================================

  async isAuthenticated(): Promise<boolean> {
    throw new Error('This feature is not supported in Forge');
  }

  async currentUser(): Promise<User> {
    throw new Error('This feature is not supported in Forge');
  }

  async authenticate(): Promise<boolean> {
    return Promise.reject('This feature is not supported in Forge');
  }

  async verifyIdToken() {
    return Promise.reject('This feature is not supported in Forge');
  }

  async createCustomToken(): Promise<string> {
    return Promise.reject('This feature is not supported in Forge');
  }

  async signOut(): Promise<void> {
    return Promise.reject('This feature is not supported in Forge');
  }

  async enqueue() {
    return Promise.reject('This feature is not supported in Forge');
  }

  async count(): Promise<number> {
    return Promise.reject('This feature is not supported in Forge');
  }

  async countByQuery(qb: QueryBuilder<T>): Promise<number>;
  async countByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<number>;
  async countByQuery(): Promise<number> {
    return Promise.reject('This feature is not supported in Forge');
  }

  async findById(id: string): Promise<T|null> {
    const data = await kvs.get<T>(id);
    return data ? data : null;
  }

  async findByProperty(key: keyof T, value: string|number|boolean): Promise<T|null> {
    return this.findByQuery(qb => qb.where(key, '==', value));
  }

  async findByQuery(qb: QueryBuilder<T>): Promise<T|null>;
  async findByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<T|null>;
  async findByQuery(qb: QueryBuilder<T>|((qb: QueryBuilder<T>) => QueryBuilder<T>)): Promise<T|null> {
    const queryBuilder = typeof qb === 'function' ? qb(new QB()) : qb;
    const result = await this.findAllByQuery(queryBuilder.limit(1));

    // Do not assume deconstruction, make sure that we actually get expected Paginated<T> returned
    if (!isOfType<Paginated<T>>(result, 'values')) {
      throw new Error('Unexpected argument exception: findAllByQuery did not return paginated list of results');
    }

    return result.values[0];
  }

  async findAll(): Promise<Paginated<T>> {
    const getPaginatedResults = async (cursor?: string) => {
      const entities: Array<T> = [];
      const result = cursor ? await kvs.query().cursor(cursor).limit(100).getMany<T>() : await kvs.query().limit(100).getMany<T>();
      entities.push(...result.results.map(item => item.value));
      if (result.nextCursor) {
        entities.push(...await getPaginatedResults(result.nextCursor))
      }
      return entities;
    }

    const result = await getPaginatedResults();
    return {
      start: 0,
      size: result.length,
      total: result.length,
      values: result,
      last: true
    };
  }

  async findAllByProperty(key: keyof T, value: string|number|boolean): Promise<Paginated<T>> {
    return this.findAllByQuery((ref) => ref.where(key, '==', value));
  }

  async findAllByQuery(qb: QueryBuilder<T>): Promise<Paginated<T>>;
  async findAllByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<Paginated<T>>;
  async findAllByQuery(qb: unknown): Promise<Paginated<T>> {

    let query = kvs.query();
    const queryBuilder: QueryBuilder<T> = typeof qb === 'function' ? qb(new QB()) : qb;

    queryBuilder.conditions.forEach((condition) => {
      if (condition.key === 'orderBy') {
        // Skip because this is not available in KVS
      } else if (condition.key === 'limit') {
        query = query.limit(condition.value as number);
      } else if (condition.key === 'offset') {
        // Skip because this is not available in KVS
      } else if (!condition.value) {
        // Skip empty filter statement
      } else {
        // Skip because this is not available in KVS
      }
    });

    const getPaginatedResults = async (cursor?: string) => {
      const entities: Array<T> = [];
      const result = cursor ? await query.cursor(cursor).limit(100).getMany<T>() : await query.limit(100).getMany<T>();
      entities.push(...result.results.map(item => item.value));
      if (result.nextCursor) {
        entities.push(...await getPaginatedResults(result.nextCursor))
      }
      return entities;
    }

    const result = await getPaginatedResults();
    return {
      start: 0,
      size: result.length,
      total: result.length,
      values: result,
      last: true
    };
  }

  async saveAll(entities: Array<T>): Promise<Array<T>> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    return Promise.all(entities.map(entity => this.save(entity)));
  }

  async save(entity: T): Promise<T> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    entity.id = entity.id || uniqid();

    // Make sure to remove undefined properties
    const safeObject = this.objectify(entity);
    if (safeObject) {
      await kvs.set<T>(entity.id, entity);
    }

    return entity;
  }

  async deleteAll(options?: QueryOptions): Promise<void>;
  async deleteAll(entities: Array<T>, options?: QueryOptions): Promise<void>;
  async deleteAll(entities?: Array<T>|QueryOptions): Promise<void> {
    if (this.readOnly) {
      throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    } else if (!Array.isArray(entities)) {
      throw new Error('This feature is not supported in Forge');
    }
    await Promise.all(entities.map((entity: T) => this.delete(entity)));
  }

  async delete(entity: T): Promise<void> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    return this.deleteById(entity.id);
  }

  async deleteById(id: string): Promise<void> {
    if (this.readOnly) {
      throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    } else if (!id) {
      throw new Error('`id` is a required parameter');
    }

    await kvs.delete(id);
  }

  async deleteFromStorage(): Promise<void> {
    return Promise.reject('This feature is not supported in Forge');
  }

  // Make sure to remove undefined properties
  // Also turn objects into the right format for Firebase
  // Firebase supports primitives (string, number, boolean, null) and structures (array, map, GeoPoint, Timestamp and Reference)
  private objectify(entity: unknown): KeyValueStoreObject {

    // If this is an object map, we should loop over each item in the object and apply the same formatting rules for each item
    if (entity !== null && typeof entity === 'object' && Object.keys(entity).length > 0) {
      const { ...item } = entity as Record<string, unknown>;
      for (const key in item) {
        item[key] = this.objectifyNestedObjects(item[key]);
        if (item[key] === undefined) {
          delete item[key];
        }
      }
      return item;
    }

    // If the entity is not a firebase primitive or supported structure, throw an error
    throw new Error('Unsupported format');
  }

  // Make sure to remove undefined properties
  // Also turn objects into the right format for Firebase
  // Firebase supports primitives (string, number, boolean, null) and structures (array, map, GeoPoint, Timestamp and Reference)
  private objectifyNestedObjects(entity: unknown): KeyValueStoreObject|null|undefined {

    // If this is a firestore primitive (string, boolean, number) or predefined structure (GeoPoint / Timestamp) just return the object
    // We are adding NULL here because otherwise Typescript freaks out even though the NULL is also part of the isFirestorePrimitive() check
    if (entity === null || this.isKVSPrimitive(entity)) {
      return entity;

    // If this is an array, we should loop over each item in the array and apply the same formatting rules for each item
    } else if (Array.isArray(entity)) {
      return (entity
        // Remove entries that do not match the supported formats
        .filter(item => item === null || this.isKVSPrimitive(item) || Array.isArray(item) || (typeof item === 'object' && Object.keys(item).length > 0))
        // Recursively apply the same formatting rules for each item in the array
        .map(this.objectifyNestedObjects.bind(this)) as KeyValueStoreObject);

    // If this is an object map, we should loop over each item in the object and apply the same formatting rules for each item
    } else if (typeof entity === 'object' && Object.keys(entity).length > 0) {
      const {...item} = entity as Record<string, unknown>;
      for (const key in item) {
        const value = this.objectifyNestedObjects(item[key]);
        if (value === undefined || (value !== null && typeof value === 'object' && Object.keys(value).length <= 0)) {
          delete item[key];
        } else {
          item[key] = value;
        }
      }
      return item;
    }

    // If the entity is not a firebase primitive or supported structure, it should be removed
    return undefined;
  }

  private isKVSPrimitive(entity: unknown): entity is KeyValueStoreObject {
    return entity === null ||
      typeof entity === 'string' ||
      typeof entity === 'boolean' ||
      typeof entity === 'number' ||
      typeof entity === 'object' ||
      Array.isArray(entity);
  }

  static getIdentifier(): symbol {
    return Symbol.for('ForgeRepository');
  }

}
