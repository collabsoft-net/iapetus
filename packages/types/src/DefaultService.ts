import { BaseService } from './BaseService';
import { DTO } from './DTO';
import { Entity, EntityArray, ObjectArray } from './Entity';
import { Paginated } from './Paginated';
import { QueryBuilder } from './QueryBuilder';

export interface DefaultService<T extends Entity, X extends DTO> extends BaseService {
  findAll(): Promise<Paginated<T>>;
  findAllByProperty(key: string, value: string): Promise<Paginated<T>>;
  findAllByQuery(qb: (qb: QueryBuilder) => QueryBuilder): Promise<Paginated<T>>;
  findById(id: string): Promise<T|null>;

  toDTO(entity: T): X;
  toEntityArray<Y extends Entity>(items: Array<Y>): EntityArray<Y>;
  toObjectArray<Y>(items: Array<Y>, keyProp: string): ObjectArray<Y>;
  toArray<Y>(items: ObjectArray<Y>): Array<Y>;
  toArray<Y extends Entity>(items: EntityArray<Y>): Array<Y>;

  save(entity: T|X): Promise<T>;
  saveAll(entities: Array<T|X>): Promise<Array<T>>;

  deleteAll(entities?: Array<T>): Promise<Array<void>>;
  delete(entity: T): Promise<void>;
  deleteById(id: string): Promise<void>;

  validate(entity: Entity): Array<string>;
  isValidEntity(entity: Entity|DTO): boolean;
}
