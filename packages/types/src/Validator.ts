
import type { Entity } from './Entity';

export interface Validator<T extends Entity> {
  validate(entity: T): boolean;
}