import { DefaultService, DTO,Entity, EntityArray, Paginated, QueryBuilder, QueryOptions, Repository, Validator } from '@collabsoft-net/types';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractService<T extends Entity, X extends DTO> implements DefaultService<T, X> {

  constructor(protected repository: Repository, protected options: QueryOptions) {}

  abstract toDTO(entity: T): X;

  toEntityArray<Y extends Entity>(items: Array<Y>): EntityArray<Y> {
    const entities: EntityArray<Y> = <EntityArray<Y>>{};
    items.forEach((entity: Y) => {
      entities[entity.id] = entity;
    });
    return entities;
  }

  toObjectArray<Y>(items: Array<Y>, keyProp = 'id'): Record<string, Y> {
    const result = {} as Record<string, Y>;
    items.forEach((item: Y) => {
      const keyPropValue = (item as unknown as Record<string, string>)[keyProp];
      result[keyPropValue] = item;
    });
    return result;
  }

  toArray<Y extends Entity>(items: EntityArray<Y>): Array<Y> {
    const entities = [] as Array<Y>;
    Object.keys(items).forEach((key: string) => {
      entities.push(items[key]);
    });
    return entities;
  }

  async count(options: QueryOptions = { }): Promise<number> {
    return this.repository.count({ ...this.options, ...options });
  }

  async countByQuery(qb: QueryBuilder, options?: QueryOptions): Promise<number>;
  async countByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options?: QueryOptions): Promise<number>;
  async countByQuery(qb: QueryBuilder|((qb: QueryBuilder) => QueryBuilder), options: QueryOptions = {}): Promise<number> {
    return this.repository.countByQuery(qb, { ...this.options, ...options });
  }

  async findById(id: string, options: QueryOptions = {}): Promise<T|null> {
    return this.repository.findById(id, { ...this.options, ...options });
  }

  async findByProperty(key: string, value: string|number|boolean, options: QueryOptions = {}): Promise<T|null> {
    return this.repository.findByProperty(key, value, { ...this.options, ...options });
  }

  async findByQuery(qb: QueryBuilder, options?: QueryOptions): Promise<T|null>;
  async findByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options?: QueryOptions): Promise<T|null>;
  async findByQuery(qb: QueryBuilder|((qb: QueryBuilder) => QueryBuilder), options: QueryOptions = {}): Promise<T|null> {
    return this.repository.findByQuery(qb, { ...this.options, ...options });
  }

  async findAll(options: QueryOptions = {}): Promise<Paginated<T>> {
    return this.repository.findAll({ ...this.options, ...options });
  }

  async findAllByProperty(key: string, value: string|number|boolean, options: QueryOptions = {}): Promise<Paginated<T>> {
    return this.repository.findAllByProperty(key, value, { ...this.options, ...options });
  }

  async findAllByQuery(qb: QueryBuilder): Promise<Paginated<T>>;
  async findAllByQuery(qb: (qb: QueryBuilder) => QueryBuilder): Promise<Paginated<T>>;
  async findAllByQuery(qb: QueryBuilder|((qb: QueryBuilder) => QueryBuilder), options: QueryOptions = {}): Promise<Paginated<T>> {
    return this.repository.findAllByQuery(qb, { ...this.options, ...options });
  }

  async save(entity: T): Promise<T> {
    const errors = this.validate(entity);
    if (errors.length > 0) return Promise.reject(new Error(errors[0]));
    return this.repository.save(entity, {...this.options, instanceId: this.options.instanceId || entity.instanceId});
  }

  async saveAll(entities: Array<T>): Promise<Array<T>> {
    return Promise.all(entities.map((entity: T) => this.save(entity)));
  }

  async deleteAll(entities?: Array<T>): Promise<Array<void>> {
    const items = entities || (await this.findAll()).values;
    return Promise.all(items.map(this.delete.bind(this)));
  }

  async delete(entity: T): Promise<void> {
    await this.repository.delete(entity, this.options);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.deleteById(id, this.options);
  }

  abstract isValidEntity(entity: Entity|DTO): boolean;
  protected abstract get validators(): Array<Validator>;
  protected registerEventListeners(): void {}

  validate(entity: Entity): Array<string> {
    const messages = [] as Array<string>;
    this.validators.forEach((validator: Validator) => {
      if (!validator.validate(entity)) {
        messages.push(validator.toString());
      }
    });
    return messages;
  }

}
