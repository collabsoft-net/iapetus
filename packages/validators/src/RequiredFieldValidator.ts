
import { Entity } from '@collabsoft-net/types';

import AbstractValidator from './AbstractValidator';

export class RequiredFieldValidator extends AbstractValidator {

  validate(entity: Entity): boolean {

    const keys = Object.keys(entity).map(key => Object.prototype.hasOwnProperty.call(entity, key));
    if (!keys) {
      return false;
    }

    const field = entity[this.field];

    if (!field && typeof field !== 'number' && !(field instanceof Date)) {
      return false;
    } else if (this.acceptedValues) {
      if (this.acceptedValues instanceof Array) {
        return (this.acceptedValues.indexOf(field) >= 0);
      } else if (typeof this.acceptedValues === 'string' || typeof this.acceptedValues === 'number') {
        return field === this.acceptedValues;
      }
    } else if (typeof field === 'string') {
      return field !== '';
    } else if (typeof field === 'number') {
      return true;
    } else if (field instanceof Date) {
      return true;
    } else if (field instanceof Array) {
      return field.length > 0;
    } else if (typeof field === 'function') {
      return field();
    } else if (typeof field === 'object') {
      const keys = Object.keys(field as Record<string, unknown>).map(key => Object.prototype.hasOwnProperty.call(field, key));
      return keys.length > 0;
    }

    return false;
  }

  toString(): string {
    if (this.customMessage) {
      return this.customMessage;
    } else if (this.label) {
      return `${this.label} is a required field`;
    } else if (this.field) {
      return `${this.field} is a required field`;
    } else {
      return 'Some field has been marked required, but I am not sure which one';
    }
  }

}