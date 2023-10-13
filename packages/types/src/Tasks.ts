import { CustomEvent, TenantAwareEvent } from './Events';

export interface TaskHandler<T extends TenantAwareEvent> {
  name: string;
  process: (event: CustomEvent<T>) => Promise<void>;
}