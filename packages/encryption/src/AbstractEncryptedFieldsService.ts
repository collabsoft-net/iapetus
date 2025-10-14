import { AbstractService } from '@collabsoft-net/services';
import { EncryptedFieldsEntity, EncryptedFieldsEntityDTO, Paginated, QueryBuilder, QueryOptions, Repository } from '@collabsoft-net/types';
import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'crypto';

import { EncryptionKeyManager } from './EncyptionKeyManager';

export interface EncryptedFieldsQueryOptions extends QueryOptions {
  encryptionKeyName: string;
  headerPrefix?: string;
}

export abstract class AbstractEncryptedFieldsService<T extends EncryptedFieldsEntity, X extends EncryptedFieldsEntityDTO<T>> extends AbstractService<T, X> {

  abstract get encryptedFields(): Array<keyof T>;
  protected options: EncryptedFieldsQueryOptions & { headerPrefix: string };

  constructor(repository: Repository<T>, private keyManager: EncryptionKeyManager, options: EncryptedFieldsQueryOptions) {
    super(repository, options);
    this.options = {
      ...options,
      headerPrefix: options.headerPrefix || 'aes256'
    };
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
    const isEncrypted = Object.entries(entity).some(([ _, value ]) => typeof value === 'string' && value.startsWith(`${this.options.headerPrefix}:`));
    if (isEncrypted) throw new Error(`Unable to encrypt entity ${entity.id}, some properties are already encrypted`);

    const encryptionKey = this.keyManager.get(this.options.encryptionKeyName);
    const header = this.keyManager.toHeader(this.options.headerPrefix, this.options.encryptionKeyName, ':');
    if (!encryptionKey) throw new Error(`Unable to find encryption key '${this.options.encryptionKeyName}'`);

    const nonce = randomBytes(16);
    const pepper = createHash('sha256').update(entity.salt).digest('hex');
    const cipherKey = scryptSync(`${encryptionKey}-${pepper}`, entity.salt, 32);
    const encryptedEntity = { ...entity, nonce: nonce.toString('hex') };

    Object.entries(entity)
      .filter(([ key ]) => key !== 'salt' && key !== 'nonce' && this.encryptedFields.includes(key as keyof T))
      .forEach(([ key, value ]) => {
        const cipher = createCipheriv('aes-256-cbc', cipherKey, nonce);
        const payload = JSON.stringify(value);
        const encryptedValue = cipher.update(payload, 'utf8', 'hex') + cipher.final('hex');
        (encryptedEntity as unknown as Record<string, unknown>)[key] = `${header};${encryptedValue}`;
      });

    return encryptedEntity;
  }

  private decrypt(entity: T): T {
    const isEncrypted = Object.entries(entity).some(([ _, value ]) => typeof value === 'string' && value.startsWith(`${this.options.headerPrefix}:`));
    if (!isEncrypted) return entity;

    const nonce = Buffer.from(entity.nonce, 'hex');
    const decryptedEntity = { ...entity };

    Object.entries(entity)
      .filter(([ key, value ]) =>
        key !== 'salt' &&
        key !== 'nonce' &&
        this.encryptedFields.includes(key as keyof T) &&
        (typeof value === 'string' && value.startsWith('aes256:'))
      ).forEach(([ key, value ]) => {
        const [ header, encryptedValue ] = value.split(';');
        const encryptionKey = this.keyManager.fromHeader(header, this.options.headerPrefix, ':');
        if (!encryptionKey) throw new Error(`Unable to find encryption key '${this.options.encryptionKeyName}'`);

        const pepper = createHash('sha256').update(entity.salt).digest('hex');
        const cipherKey = scryptSync(`${encryptionKey}-${pepper}`, entity.salt, 32);

        const decipher = createDecipheriv('aes-256-cbc', cipherKey, nonce);
        const decryptedValue = decipher.update(encryptedValue, 'hex', 'utf8') + decipher.final('utf8');
        const payload = JSON.parse(decryptedValue);
        (decryptedEntity as unknown as Record<string, unknown>)[key] = payload;
      });

    return decryptedEntity;
  }

}