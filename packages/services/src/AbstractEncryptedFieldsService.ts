import { EncryptedFieldsEntity, EncryptedFieldsEntityDTO, Paginated, QueryBuilder, QueryOptions, Repository } from '@collabsoft-net/types';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

import { AbstractService } from './AbstractService';

export interface EncryptedFieldsQueryOptions extends QueryOptions {
  encryptionKey: string;
}

export abstract class AbstractEncryptedFieldsService<T extends EncryptedFieldsEntity, X extends EncryptedFieldsEntityDTO<T>> extends AbstractService<T, X> {

  abstract get encryptedFields(): Array<keyof T>;
  protected options: EncryptedFieldsQueryOptions;

  constructor(repository: Repository<T>, options: EncryptedFieldsQueryOptions) {
    super(repository, options);
    this.options = options;
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
      values: result.values.map(this.decrypt)
    }
  }

  async findAllByProperty(key: keyof T, value: string | number | boolean): Promise<Paginated<T>> {
    const result = await super.findAllByProperty(key, value);
    return {
      ...result,
      values: result.values.map(this.decrypt)
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
      values: result.values.map(this.decrypt)
    }
  }

  async save(entity: T, options: QueryOptions = {}): Promise<T> {
    const errors = this.validate(entity);
    if (errors.length > 0) return Promise.reject(new Error(errors[0]));
    return this.repository.save(this.encrypt(entity), {...this.options, ...options});
  }

  private encrypt(entity: T): T {
    const isEncrypted = Object.entries(entity).some(([ _, value ]) => typeof value === 'string' && value.startsWith('aes256:'));
    if (isEncrypted) throw new Error(`Unable to encrypt entity ${entity.id}, some properties are already encrypted`);

    const nonce = randomBytes(16);
    const cipherKey = scryptSync(this.options.encryptionKey, entity.salt, 32);
    const encryptedEntity = { ...entity, nonce: nonce.toString('hex') };

    Object.entries(entity)
      .filter(([ key ]) => key !== 'salt' && key !== 'nonce' && this.encryptedFields.includes(key as keyof T))
      .forEach(([ key, value ]) => {
        const cipher = createCipheriv('aes-256-cbc', cipherKey, nonce);
        const encryptedValue = cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
        (encryptedEntity as unknown as Record<string, unknown>)[key] = `aes256:${encryptedValue}`;
      });

    return encryptedEntity;
  }

  private decrypt(entity: T): T {

    const isEncrypted = Object.entries(entity).some(([ _, value ]) => typeof value === 'string' && value.startsWith('aes256:'));
    if (!isEncrypted) return entity;

    const nonce = Buffer.from(entity.nonce, 'hex');
    const cipherKey = scryptSync(this.options.encryptionKey, entity.salt, 32);
    const decryptedEntity = { ...entity };

    Object.entries(entity)
      .filter(([ key, value ]) =>
        key !== 'salt' &&
        key !== 'nonce' &&
        this.encryptedFields.includes(key as keyof T) &&
        (typeof value === 'string' && value.startsWith('aes256:'))
      ).forEach(([ key, value ]) => {
        const decipher = createDecipheriv('aes-256-cbc', cipherKey, nonce);
        const decryptedValue = decipher.update(value.substring(7), 'hex', 'utf8') + decipher.final('utf8');
        (decryptedEntity as unknown as Record<string, unknown>)[key] = decryptedValue;
      });

    return decryptedEntity;
  }

}