
import { Entity } from './Entity';

export interface Validator {
  validate(entity: Entity): boolean;
}