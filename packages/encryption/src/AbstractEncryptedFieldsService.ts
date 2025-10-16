import { AbstractService } from '@collabsoft-net/services';
import { EncryptedFieldsEntity, EncryptedFieldsEntityDTO, Paginated, QueryBuilder, QueryOptions, Repository } from '@collabsoft-net/types';
import { randomBytes } from 'crypto';

import { EncryptionManager, EncryptionManagerOptions } from './EncryptionManager';

export type EncryptedFieldsQueryOptions = QueryOptions & EncryptionManagerOptions;

export abstract class AbstractEncryptedFieldsService<T extends EncryptedFieldsEntity, X extends EncryptedFieldsEntityDTO<T>> extends AbstractService<T, X> {

  abstract get encryptedFields(): Array<keyof T>;
  private encryptionManager: EncryptionManager;

  constructor(repository: Repository<T>, protected options: EncryptedFieldsQueryOptions) {
    super(repository, options);
    this.encryptionManager = new EncryptionManager(options);
  }

  async findById(id: string): Promise<T | null> {
    const result = await super.findById(id);
    return result ? this.decrypt(result) : result;
  }

  async findByProperty(key: keyof T, value: string | number | boolean): Promise<T | null> {
    const result = await super.findByProperty(key, value);
    return result ? this.decrypt(result) : result;
  }

  async findByQuery(qb: QueryBuilder<T>, options?: QueryOptions): Promise<T|null>;
  async findByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>, options?: QueryOptions): Promise<T|null>;
  async findByQuery(qb: QueryBuilder<T>|((qb: QueryBuilder<T>) => QueryBuilder<T>), options: QueryOptions = {}): Promise<T|null> {
    const result = typeof qb === 'function'
      ? await super.findByQuery(qb as (qb: QueryBuilder<T>) => QueryBuilder<T>, options)
      : await super.findByQuery(qb as QueryBuilder<T>, options);
    return result ? this.decrypt(result) : result;
  }

  async findAll(): Promise<Paginated<T>> {
    const result = await super.findAll();
    return {
      ...result,
      values: result.values.map(this.decrypt.bind(this))
    }
  }

  async findAllByProperty(key: keyof T, value: string | number | boolean): Promise<Paginated<T>> {
    const result = await super.findAllByProperty(key, value);
    return {
      ...result,
      values: result.values.map(this.decrypt.bind(this))
    }
  }

  async findAllByQuery(qb: QueryBuilder<T>): Promise<Paginated<T>>;
  async findAllByQuery(qb: (qb: QueryBuilder<T>) => QueryBuilder<T>): Promise<Paginated<T>>;
  async findAllByQuery(qb: QueryBuilder<T>|((qb: QueryBuilder<T>) => QueryBuilder<T>)): Promise<Paginated<T>> {
    const result = typeof qb === 'function'
      ? await super.findAllByQuery(qb as (qb: QueryBuilder<T>) => QueryBuilder<T>)
      : await super.findAllByQuery(qb as QueryBuilder<T>);

    return {
      ...result,
      values: result.values.map(this.decrypt.bind(this))
    }
  }

  async save(entity: T, options: QueryOptions = {}): Promise<T> {
    const errors = this.validate(entity);
    if (errors.length > 0) return Promise.reject(new Error(errors[0]));
    return this.repository.save(this.encrypt(entity), {...this.options, ...options});
  }

  private encrypt(entity: T): T {
    const nonce = randomBytes(16);
    const encryptedEntity = { ...entity, nonce: nonce.toString('hex') } as unknown as Record<string, unknown>;

    Object.entries(entity)
      .filter(([ key ]) => key !== 'salt' && key !== 'nonce' && this.encryptedFields.includes(key as keyof T))
      .forEach(([ key, value ]) => {
        encryptedEntity[key] = this.encryptionManager.encrypt(value, entity.salt, nonce);
      });

    return encryptedEntity as T;
  }

  private decrypt(entity: T): T {
    const decryptedEntity = { ...entity } as unknown as Record<string, unknown>;

    Object.entries(entity)
      .filter(([ key ]) => key !== 'salt' && key !== 'nonce' && this.encryptedFields.includes(key as keyof T))
      .forEach(([ key, value ]) => {
        const decryptedValue = this.encryptionManager.decrypt(value, entity.salt, entity.nonce);
        decryptedEntity[key] = decryptedValue;
      });

    return decryptedEntity as T;
  }

}