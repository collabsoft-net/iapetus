import { MemoryEmitter } from '@collabsoft-net/emitters';
import { Entity, EntityArray, Event, EventListener, Paginated, QueryOptions, Repository, StorageProvider } from '@collabsoft-net/types';
import uniqid from 'uniqid';

import { QueryBuilder } from './QueryBuilder';

const SEED_CACHEKEY = 'MemoryRepository:seed'

export class MemoryRepository implements Repository {

  private emitter: MemoryEmitter;

  constructor(seed: string|Record<string, unknown>) {
    const currentSeed = window.sessionStorage.getItem(SEED_CACHEKEY);
    if (!currentSeed) {
      this.seed = (typeof seed === 'string') ? JSON.parse(seed) : seed;
    }
    this.emitter = new MemoryEmitter();
  }

  private get seed(): Record<string, unknown> {
    const value = window.sessionStorage.getItem(SEED_CACHEKEY);
    return value ? JSON.parse(value) : {};
  }

  private set seed(value: Record<string, unknown>) {
    window.sessionStorage.setItem(SEED_CACHEKEY, JSON.stringify(value));
  }

  async on(event: typeof Event|string, listener: EventListener): Promise<void> {
    return this.emitter.on(event, listener);
  }

  async emit(event: Event): Promise<void> {
    return this.emitter.emit(event);
  }

  get storage(): StorageProvider {
    throw new Error('This feature is not supported in "memory" mode');
  }


  async close(): Promise<void> {}

  async isAuthenticated(): Promise<boolean> {
    return true;
  }

  async authenticate(): Promise<boolean> {
    return true;
  }

  async createAccount(): Promise<boolean> {
    return true;
  }

  async signOut(): Promise<void> {}

  async findAll(options: MemoryQueryOptions = { path: '/' }): Promise<Paginated<Entity>> {
    await this.validateQueryOptions(options);
    const item = await this.getSeedObject(options.path);
    const items = (Object.entries(item).length > 0) ? this.toArray(item as unknown as EntityArray<Entity>) : [];

    return {
      start: 0,
      size: items.length,
      total: items.length,
      values: items,
      last: true
    };
  }

  async findAllByProperty(key: keyof Entity, value: string|number|boolean, options: MemoryQueryOptions = { path: '/' }): Promise<Paginated<Entity>> {
    await this.validateQueryOptions(options);
    const { values: items } = await this.findAll(options);
    const result = items.filter((item) => item[key] === value);

    return {
      start: 0,
      size: result.length,
      total: result.length,
      values: result,
      last: true
    };
  }

  async findAllByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: MemoryQueryOptions = { path: '/' }): Promise<Paginated<Entity>> {
    await this.validateQueryOptions(options);
    const queryBuilder = qb(new QueryBuilder());

    const { values: items } = await this.findAll(options);
    const filteredItems = items.filter(item => {
      let shouldInclude = true;
      queryBuilder.conditions.forEach(({ key, value, operator })=> {
        if (key !== 'limit' && key !== 'offset' && key !== 'orderBy') {
          const comparedTo = (item as unknown as Record<string, string|number|boolean>)[key];
          if (operator === '==') {
            shouldInclude = value === comparedTo;
          } else if (operator === '<') {
            shouldInclude = value < comparedTo;
          } else if (operator === '<=') {
            shouldInclude = value <= comparedTo;
          } else if (operator === '>') {
            shouldInclude = value > comparedTo;
          } else if (operator === '>=') {
            shouldInclude = value >= comparedTo;
          } else if (operator === 'array-contains' && Array.isArray(comparedTo)) {
            shouldInclude = comparedTo.includes(value);
          }
        }
        return shouldInclude;
      });
    });

    let result = filteredItems.slice();
    const limitCondition = queryBuilder.conditions.find(({key}) => key === 'limit');
    const offsetCondition = queryBuilder.conditions.find(({key}) => key === 'offset');
    const offset = offsetCondition && (typeof offsetCondition.value === 'string' || typeof offsetCondition.value === 'number')
      ? typeof offsetCondition.value === 'string' ? parseInt(offsetCondition.value) : offsetCondition.value
      : 0;

    if (limitCondition && (typeof limitCondition.value === 'string' || typeof limitCondition.value === 'number')) {
      const limit = typeof limitCondition.value !== 'number' ? parseInt(limitCondition.value) : limitCondition.value;
      result = result.slice(typeof offset !== 'number' ? parseInt(offset) : offset).slice(0, limit);
    }

    const orderByCondition = queryBuilder.conditions.find(({key}) => key === 'orderBy');
    if (orderByCondition && typeof orderByCondition.value === 'string') {
      const orderKey: string = orderByCondition.value;
      result.sort((a, b) => {
        const leftValue = (a as unknown as Record<string, string|number|boolean>)[orderKey];
        const rightValue = (b as unknown as Record<string, string|number|boolean>)[orderKey];

        if (orderByCondition.operator === 'asc') {
          return leftValue < rightValue ? -1 : leftValue === rightValue ? 0 : 1;
        } else if (orderByCondition.operator === 'desc') {
          return leftValue > rightValue ? -1 : leftValue === rightValue ? 0 : 1;
        } else {
          return 0;
        }
      })
    }

    return {
      start: offset,
      size: result.length,
      total: filteredItems.length,
      values: result,
      last: offset + result.length >= filteredItems.length
    };
  }

  async findById(id: string, options: MemoryQueryOptions = { path: '/' }): Promise<Entity|null> {
    await this.validateQueryOptions(options);
    const item = await this.getSeedObject(`${options.path}/${id}`);
    return (Object.entries(item).length > 0) ? item : null;
  }

  async findByProperty(key: keyof Entity, value: string|number|boolean, options: MemoryQueryOptions = { path: '/' }): Promise<Entity|null> {
    await this.validateQueryOptions(options);
    const { values: items } = await this.findAllByProperty(key, value, options);
    return items[0];
  }

  async findByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: MemoryQueryOptions = { path: '/' }): Promise<Entity|null> {
    const { values } = await this.findAllByQuery(qb, options);
    return values[0];
  }

  async saveAll(entities: Array<Entity>, options: MemoryQueryOptions = { path: '/' }): Promise<Array<Entity>> {
    await this.validateQueryOptions(options);
    return await Promise.all(entities.map((entity: Entity) => this.save(entity, options)));
  }

  async save(entity: Entity, options: MemoryQueryOptions = { path: '/' }): Promise<Entity> {
    entity.id = entity.id || uniqid();
    await this.validateQueryOptions(options);
    await this.setSeedObject(options.path, entity);
    return entity;
  }

  async deleteAll(options: MemoryQueryOptions): Promise<void>;
  async deleteAll(entities: Array<Entity>, options?: MemoryQueryOptions): Promise<void>;
  async deleteAll(entities: Array<Entity>|MemoryQueryOptions, options?: MemoryQueryOptions): Promise<void> {
    const _options = (!options) ? entities as MemoryQueryOptions : options;

    if (Array.isArray(entities)) {
      return this.validateQueryOptions(_options)
        .then(() => Promise.all(entities.map((entity: Entity) => this.delete(entity, _options))))
        .then(() => Promise.resolve());
    } else {
      return this.validateQueryOptions(_options)
        .then(() => this.deleteSeedObject(_options.path))
        .then(() => Promise.resolve());
    }
  }

  delete(entity: Entity, options: MemoryQueryOptions): Promise<void> {
    return this.deleteById(entity.id, options);
  }

  deleteById(id: string, options: MemoryQueryOptions): Promise<void> {
    if (!id) {
      return Promise.reject('`id` is a required parameter');
    }

    return this.validateQueryOptions(options)
      .then(() => this.deleteSeedObject(`${options.path}/${id}`))
      .then(() => Promise.resolve());
  }

  async deleteFromStorage(): Promise<void> {}

  private validateQueryOptions(options: MemoryQueryOptions): Promise<void> {
    if (!options.path) {
      return Promise.reject(new Error('`path` is a required option for memory repositories'));
    }
    return Promise.resolve();
  }

  private async getSeedObject(path: string|Array<string>): Promise<Entity> {
    path = (path instanceof Array) ? path : path.split('/');
    let obj: Record<string, unknown> = this.seed;

    while (path.length >= 1) {
      const elem = path.shift();
      if (elem) {
        if (!obj[elem]) {
          obj[elem] = {};
        }
        obj = obj[elem] as Record<string, unknown>;
      }
    }

    obj = obj || {};
    return obj as unknown as Entity;
  }

  private async setSeedObject(path: string|Array<string>, entity: Entity): Promise<Entity> {
    const seed = {...this.seed};
    path = (path instanceof Array) ? path : path.split('/');
    let obj: Record<string, unknown> = seed;

    while (path.length >= 1) {
      const elem = path.shift();
      if (elem) {
        if (!obj[elem]) {
          obj[elem] = {};
        }
        obj = obj[elem] as Record<string, unknown>;
      }
    }

    obj = obj || {};
    obj[entity.id] = entity;

    this.seed = seed;
    return entity;
  }

  private async deleteSeedObject(path: string|Array<string>): Promise<void> {
    const seed = {...this.seed};
    path = (path instanceof Array) ? path : path.split('/');
    const originalPath = path.slice();
    let obj: Record<string, unknown> = seed;

    while (path.length > 1) {
      const elem = path.shift();
      if (elem) {
        obj = obj[elem] as Record<string, unknown>;
      }
    }

    const elem = path.shift();
    if (elem) {
      delete obj[elem];
      this.seed = seed;
      return Promise.resolve();
    } else {
      return Promise.reject(`Could not find entity for path ${originalPath.join('/')}`);
    }
  }

  private toArray(items: EntityArray<Entity>): Array<Entity> {
    return Object.keys(items).filter((id: string) => Object.keys(items[id]).length > 0).map((id: string) => items[id]);
  }

}

export interface MemoryQueryOptions extends QueryOptions {
  path: string;
}
