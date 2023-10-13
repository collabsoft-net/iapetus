import { TaskQueueOptions } from 'firebase-functions/v2/tasks';

import { CustomEvent, TenantAwareEvent } from './Events';

export interface TaskHandler<T extends TenantAwareEvent> {
  name: string;
  options?: TaskQueueOptions;
  process: (event: CustomEvent<T>) => Promise<void>;
}