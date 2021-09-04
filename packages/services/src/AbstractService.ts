import { DefaultService, DTO,Entity, EntityArray, Paginated, QueryBuilder, QueryOptions, Repository, Validator } from '@collabsoft-net/types';

export abstract class AbstractService<T extends Entity, X extends DTO> implements DefaultService<T, X> {

  constructor(private repository: Repository, private options: QueryOptions) {}

  abstract toDTO(entity: T): X;

  toEntityArray<Y extends Entity>(items: Array<Y>): EntityArray<Y> {
    const entities: EntityArray<Y> = <EntityArray<Y>>{};
    items.forEach((entity: Y) => {
      entities[entity.id] = entity;
    });
    return entities;
  }

  toObjectArray<Y extends unknown>(items: Array<Y>, keyProp = 'id'): Record<string, Y> {
    const result = {} as Record<string, Y>;
    items.forEach((item: Y) => {
      const keyPropValue = (item as Record<string, string>)[keyProp];
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

  async findById(id: string, options: QueryOptions = {}): Promise<T|null> {
    return this.repository.findById(id, Object.assign({}, this.options, options)) as Promise<T|null>;
  }

  async findByProperty(key: string, value: string, options: QueryOptions = {}): Promise<T|null> {
    return this.repository.findByProperty(key, value, Object.assign({}, this.options, options)) as Promise<T|null>;
  }

  async findByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: QueryOptions = {}): Promise<T> {
    return this.repository.findByQuery(qb, Object.assign({}, this.options, options)) as Promise<T>;
  }

  async findAll(options: QueryOptions = {}): Promise<Paginated<T>> {
    return this.repository.findAll(Object.assign({}, this.options, options)) as Promise<Paginated<T>>;
  }

  async findAllByProperty(key: string, value: string, options: QueryOptions = {}): Promise<Paginated<T>> {
    return this.repository.findAllByProperty(key, value, Object.assign({}, this.options, options)) as Promise<Paginated<T>>;
  }

  async findAllByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: QueryOptions = {}): Promise<Paginated<T>> {
    return this.repository.findAllByQuery(qb, Object.assign({}, this.options, options)) as Promise<Paginated<T>>;
  }

  async save(entity: T): Promise<T> {
    const errors = this.validate(entity);
    if (errors.length > 0) return Promise.reject(new Error(errors[0]));
    return this.repository.save(entity, {...this.options, instanceId: this.options.instanceId || entity.instanceId}) as Promise<T>;
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
