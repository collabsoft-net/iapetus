import { DTO } from './DTO';
import { Entity } from './Entity';
import { Paginated } from './Paginated';
import { QueryBuilder } from './QueryBuilder';

export interface BaseService<T extends Entity> {
  findAll(): Promise<Paginated<T>>;
  findAllByProperty(key: string, value: string): Promise<Paginated<T>>;
  findAllByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<Paginated<T>>;
  findById(id: string): Promise<Entity|null>;
  findByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<Entity|null>;

  save(entity: Entity|DTO): Promise<T>;
  saveAll(entities: Array<Entity|DTO>): Promise<Array<T>>;

  deleteAll(entities?: Array<T>): Promise<Array<void>>;
  delete(entity: Entity): Promise<void>;
  deleteById(id: string): Promise<void>;

  validate(entity: Entity): Array<string>;
  isValidEntity(entity: Entity|DTO): boolean;
}