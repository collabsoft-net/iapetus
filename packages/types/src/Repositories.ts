import type { Entity } from './Entity';
import type { EventEmitter } from './Events';
import type { Paginated } from './Paginated';
import type { QueryBuilder } from './QueryBuilder';
import type { StorageProvider } from './StorageProvider';
import type { User } from './User';

export interface Repository<T extends Entity> extends EventEmitter {
  close(): Promise<void>;
  authenticate(token: string): Promise<boolean>;
  isAuthenticated(): Promise<boolean>;
  currentUser(): Promise<User|null>;
  signOut(): Promise<void>;

  count(options?: QueryOptions): Promise<number>;
  countByQuery(qb: QueryBuilder<T>, options?: QueryOptions): Promise<number>;
  countByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>, options?: QueryOptions): Promise<number>;
  countByQuery<A extends QueryBuilder<T>|((qb: QueryBuilder<T>) => QueryBuilder<T>),B extends QueryOptions>(qb: A, options?: B): Promise<number>;

  findById(id: string, options?: QueryOptions): Promise<T|null>;
  findByProperty(key: keyof T, value: string|number|boolean, options?: QueryOptions): Promise<T|null>;
  findByQuery(qb: QueryBuilder<T>, options?: QueryOptions): Promise<T|null>;
  findByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>, options?: QueryOptions): Promise<T|null>;
  findByQuery<A extends QueryBuilder<T>|((qb: QueryBuilder<T>) => QueryBuilder<T>),B extends QueryOptions>(qb: A, options?: B): Promise<T|null>;

  findAll(options?: QueryOptions): Promise<Paginated<T>>;
  findAllByProperty(key: keyof T, value: string|number|boolean, options?: QueryOptions): Promise<Paginated<T>>;
  findAllByQuery(qb: QueryBuilder<T>, options?: QueryOptions): Promise<Paginated<T>>;
  findAllByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>, options?: QueryOptions): Promise<Paginated<T>>;
  findAllByQuery<A extends QueryBuilder<T>|((qb: QueryBuilder<T>) => QueryBuilder<T>),B extends QueryOptions>(qb: A, options?: B): Promise<Paginated<T>>;

  save(entity: T, options?: QueryOptions): Promise<T>;
  saveAll(entities: Array<T>, options?: QueryOptions): Promise<Array<T>>;

  delete(entity: T, options?: QueryOptions): Promise<void>;
  deleteById(id: string, options?: QueryOptions): Promise<void>;
  deleteAll(options?: QueryOptions): Promise<void>;
  deleteAll(entities: Array<T>, options?: QueryOptions): Promise<void>;

  deleteFromStorage(url: string): Promise<void>;
  storage: StorageProvider;
}

export type QueryOptions = Record<string, unknown>;