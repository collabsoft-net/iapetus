
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

export class SystemEvent extends Event {
  constructor(name: string) {
    super(name);
  }
}

export class CustomEvent<T extends TenantAwareEvent> extends Event {
  constructor(name: string, public data: T) {
    super(name);
  }
}

export interface TenantAwareEvent {
  tenantId: string;
}

export interface EventEmitter {
  on(name: typeof Event|string, listener: EventListener): Promise<void>;
  emit(event: Event): Promise<void>;
}

export interface CustomEventEmitter<T extends TenantAwareEvent> {
  on(name: typeof Event|string, listener: CustomEventListener<T>): Promise<void>;
  emit(event: Event): Promise<void>;
}

export interface EventListener {
  (event: Event|SystemEvent): Promise<void>;
}

export interface CustomEventListener<T extends TenantAwareEvent> {
  (event: SystemEvent|CustomEvent<T>): Promise<void>;
}
