import { Entity } from './Entity';

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
  constructor(idOrEntity: string|T|EntityDTO<T>) {
    this.id = typeof idOrEntity === 'string' ? idOrEntity : idOrEntity.id;
  }

}