import type { EncryptedFieldsEntity } from './EncryptedFieldsEntity';
import type { Entity } from './Entity';

export class DTO implements Record<string, unknown> {

  id?: string;
  [key: string|number|symbol]: unknown;

  constructor(id?: string) {
    this.id = id;
  }
}

export class EntityDTO<T extends Entity> implements Omit<Entity, 'id'> {

  id?: string;

  constructor(id?: string);
  constructor(entity: T|EntityDTO<T>);
  constructor(idOrEntity?: string|T|EntityDTO<T>) {
    this.id = idOrEntity
      ? typeof idOrEntity === 'string'
        ? idOrEntity
        : idOrEntity.id
      : undefined;
  }

}

export class EncryptedFieldsEntityDTO<T extends EncryptedFieldsEntity> implements Omit<EncryptedFieldsEntity, 'id'|'salt'|'nonce'> {

  id?: string;

  constructor(id?: string);
  constructor(entity: T|EncryptedFieldsEntityDTO<T>);
  constructor(idOrEntity?: string|T|EncryptedFieldsEntityDTO<T>) {
    this.id = idOrEntity
      ? typeof idOrEntity === 'string'
        ? idOrEntity
        : idOrEntity.id
      : undefined;
  }

}