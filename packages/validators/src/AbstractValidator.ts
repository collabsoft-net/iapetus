
import { Entity, Validator } from '@collabsoft-net/types';

export default abstract class BaseValidator<T extends Entity> implements Validator<T> {

  protected field: keyof T;
  protected label?: string;
  protected customMessage?: string;
  protected acceptedValues?: Array<unknown>;

  constructor(field: keyof T, label?: string, customMessage?: string, acceptedValues?: Array<unknown>) {
    this.field = field;
    this.label = label;
    this.customMessage = customMessage;
    this.acceptedValues = acceptedValues;
  }

  abstract validate(entity: Entity): boolean;

}
