
import { Event, EventEmitter, EventListener } from '@collabsoft-net/types';

export class MemoryEmitter implements EventEmitter {

  private listeners: Map<string, Array<EventListener>> = new Map<string, Array<EventListener>>();

  async on(event: typeof Event|string, listener: EventListener): Promise<void> {
    event = typeof event === 'string' ? event : event.constructor.name;
    const listeners: Array<EventListener> = this.listeners.get(event) || [];
    listeners.push(listener);
    this.listeners.set(event, listeners);
  }

  async emit(event: Event): Promise<void> {
    const listeners: Array<EventListener> = this.listeners.get(event.name) || [];
    const promises: Array<Promise<void>> = listeners.map((listener: EventListener) => listener(event));
    await Promise.all(promises);
  }

  static getIdentifier(): symbol {
    return Symbol.for('MemoryEmitter');
  }

}
