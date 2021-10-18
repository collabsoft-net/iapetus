import { Entity } from './Entity';
import { EventEmitter } from './Events';
import { Paginated } from './Paginated';
import { QueryBuilder } from './QueryBuilder';
import { StorageProvider } from './StorageProvider';

export interface Repository extends EventEmitter {
  close(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  authenticate(): Promise<boolean>;
  signOut(): Promise<void>;

  findAll(options?: QueryOptions): Promise<Paginated<Entity>>;
  findAllByProperty(key: string, value: string|number|boolean, options?: QueryOptions): Promise<Paginated<Entity>>;
  findAllByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options?: QueryOptions): Promise<Paginated<Entity>>;

  findById(id: string, options?: QueryOptions): Promise<Entity|null>;
  findByProperty(key: string, value: string|number|boolean, options?: QueryOptions): Promise<Entity|null>;
  findByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options?: QueryOptions): Promise<Entity|null>;

  saveAll(entities: Array<Entity>, options?: QueryOptions): Promise<Array<Entity>>;
  save(entity: Entity, options?: QueryOptions): Promise<Entity>;

  deleteAll(options?: QueryOptions): Promise<void>;
  deleteAll(entities: Array<Entity>, options?: QueryOptions): Promise<void>;
  delete(entity: Entity, options?: QueryOptions): Promise<void>;
  deleteById(id: string, options?: QueryOptions): Promise<void>;
  deleteFromStorage(url: string): Promise<void>;

  storage: StorageProvider;
}

export type QueryOptions = Record<string, unknown>;