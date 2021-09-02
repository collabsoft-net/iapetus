import { DTO } from './DTO';
import { Entity } from './Entity';
import { Paginated } from './Paginated';
import { QueryBuilder } from './QueryBuilder';

export interface BaseService {
  findAll(): Promise<Paginated<Entity>>;
  findAllByProperty(key: string, value: string): Promise<Paginated<Entity>>;
  findAllByQuery(qb: (qb: QueryBuilder) => QueryBuilder): Promise<Paginated<Entity>>;
  findById(id: string): Promise<Entity|null>;
  findByQuery(qb: (qb: QueryBuilder) => QueryBuilder): Promise<Entity|null>;

  save(entity: Entity|DTO): Promise<Entity>;
  saveAll(entities: Array<Entity|DTO>): Promise<Array<Entity>>;

  deleteAll(entities?: Array<Entity>): Promise<Array<void>>;
  delete(entity: Entity): Promise<void>;
  deleteById(id: string): Promise<void>;

  validate(entity: Entity): Array<string>;
  isValidEntity(entity: Entity|DTO): boolean;
}