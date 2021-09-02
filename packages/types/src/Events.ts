
import { Entity, Reference } from './Entity';

export abstract class Event {
  name: string; // The name of the event
  attributes: Map<string, string> = new Map<string, string>();

  constructor(name?: string) {
    if (name) {
      this.name = name;
    } else {
      const proto = Object.getPrototypeOf(this);
      this.name = proto.constructor.name;
    }
  }
}

export abstract class EntityEvent extends Event {
  entity: Entity; // The entity involved
  prevEntity?: Entity; // The previous version of the entity involved;
  reference?: Reference; // The reference of the entity involved;

  constructor(entity: Entity, name?: string) {
    super(name);
    this.entity = entity;
  }
}

export class CustomEvent extends Event {
  data?: unknown;

  constructor(name: string, data?: unknown) {
    super(name);
    this.data = data;
  }
}

export interface EventEmitter {
  on(name: typeof Event|string, listener: EventListener|EntityEventListener): Promise<void>;
  emit(event: Event): Promise<void>;
}

export interface EventListener {
  (event: Event): Promise<void>;
}

export interface EntityEventListener {
  (event: EntityEvent): Promise<void>;
}
