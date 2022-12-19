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

  count(options?: QueryOptions): Promise<number>;
  countByQuery(qb: QueryBuilder, options?: QueryOptions): Promise<number>;
  countByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options?: QueryOptions): Promise<number>;
  countByQuery<A extends QueryBuilder|((qb: QueryBuilder) => QueryBuilder),B extends QueryOptions>(qb: A, options?: B): Promise<number>;

  findById<T extends Entity>(id: string, options?: QueryOptions): Promise<T|null>;
  findByProperty<T extends Entity>(key: string, value: string|number|boolean, options?: QueryOptions): Promise<T|null>;
  findByQuery<T extends Entity>(qb: QueryBuilder, options?: QueryOptions): Promise<T|null>;
  findByQuery<T extends Entity>(qb: (qb: QueryBuilder) => QueryBuilder, options?: QueryOptions): Promise<T|null>;
  findByQuery<T extends Entity, A extends QueryBuilder|((qb: QueryBuilder) => QueryBuilder),B extends QueryOptions>(qb: A, options?: B): Promise<T|null>;

  findAll<T extends Entity>(options?: QueryOptions): Promise<Paginated<T>>;
  findAllByProperty<T extends Entity>(key: string, value: string|number|boolean, options?: QueryOptions): Promise<Paginated<T>>;
  findAllByQuery<T extends Entity>(qb: QueryBuilder, options?: QueryOptions): Promise<Paginated<T>>;
  findAllByQuery<T extends Entity>(qb: (qb: QueryBuilder) => QueryBuilder, options?: QueryOptions): Promise<Paginated<T>>;
  findAllByQuery<T extends Entity, A extends QueryBuilder|((qb: QueryBuilder) => QueryBuilder),B extends QueryOptions>(qb: A, options?: B): Promise<Paginated<T>>;

  save<T extends Entity>(entity: T, options?: QueryOptions): Promise<T>;
  saveAll<T extends Entity>(entities: Array<T>, options?: QueryOptions): Promise<Array<T>>;

  delete<T extends Entity>(entity: T, options?: QueryOptions): Promise<void>;
  deleteById(id: string, options?: QueryOptions): Promise<void>;
  deleteAll(options?: QueryOptions): Promise<void>;
  deleteAll<T extends Entity>(entities: Array<T>, options?: QueryOptions): Promise<void>;

  deleteFromStorage(url: string): Promise<void>;
  storage: StorageProvider;
}

export type QueryOptions = Record<string, unknown>;