import type { Entity } from './Entity';

export interface EncryptedFieldsEntity extends Entity {
  salt: string;
  nonce: string;
}