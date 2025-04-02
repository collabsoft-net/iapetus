import { EntityDTO } from './DTO';
import { Entity } from './Entity';
import { Paginated } from './Paginated';
import { QueryBuilder } from './QueryBuilder';

export interface BaseService<T extends Entity, X extends EntityDTO<T>> {
  findAll(): Promise<Paginated<T>>;
  findAllByProperty(key: keyof T, value: string): Promise<Paginated<T>>;
  findAllByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<Paginated<T>>;
  findById(id: string): Promise<T|null>;
  findByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<T|null>;

  save(entity: T|X): Promise<T>;
  saveAll(entities: Array<T|X>): Promise<Array<T>>;

  deleteAll(entities?: Array<T>): Promise<Array<void>>;
  delete(entity: T): Promise<void>;
  deleteById(id: string): Promise<void>;

  validate(entity: T): Array<string>;
  isValidEntity(entity: T|X): boolean;
}