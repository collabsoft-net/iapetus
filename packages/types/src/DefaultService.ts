import { BaseService } from './BaseService';
import { DTO } from './DTO';
import { Entity, EntityArray, ObjectArray } from './Entity';
import { Paginated } from './Paginated';
import { QueryBuilder } from './QueryBuilder';

export interface DefaultService<T extends Entity, X extends DTO> extends BaseService<T> {
  count(): Promise<number>;
  countByQuery(qb: QueryBuilder<T>): Promise<number>;
  countByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<number>;
  countByQuery(qb: unknown): Promise<number>;

  findById(id: string): Promise<T|null>;
  findByProperty(key: string, value: string|number|boolean): Promise<T|null>;
  findByQuery(qb: QueryBuilder<T>): Promise<T|null>;
  findByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<T|null>;

  findAll(): Promise<Paginated<T>>;
  findAllByProperty(key: string, value: string|number|boolean): Promise<Paginated<T>>;
  findAllByQuery(qb: QueryBuilder<T>): Promise<Paginated<T>>;
  findAllByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<Paginated<T>>;

  toDTO(entity: T): X;
  toEntityArray<Y extends Entity>(items: Array<Y>): EntityArray<Y>;
  toObjectArray<Y>(items: Array<Y>, keyProp: string): ObjectArray<Y>;
  toArray<Y>(items: ObjectArray<Y>): Array<Y>;
  toArray<Y extends Entity>(items: EntityArray<Y>): Array<Y>;

  save(entity: T|X): Promise<T>;
  saveAll(entities: Array<T|X>): Promise<Array<T>>;

  delete(entity: T): Promise<void>;
  deleteById(id: string): Promise<void>;
  deleteAll(entities?: Array<T>): Promise<Array<void>>;

  validate(entity: Entity): Array<string>;
  isValidEntity(entity: Entity|DTO): boolean;
}
