import { CloudEvent } from 'firebase-functions/v2';
import { MessagePublishedData } from 'firebase-functions/v2/pubsub';

import { CustomEvent, TenantAwareEvent } from './Events';

export interface PubSubOptions {
  projectId: string;
  apiKey?: string;
}

export interface PubSubHandler<T extends TenantAwareEvent> {
  name?: string;
  topic: string;
  timeoutSeconds?: number;
  process: (message: CloudEvent<MessagePublishedData<CustomEvent<T>>>) => Promise<void>;
}

export interface ScheduledPubSubHandler {
  name: string;
  schedule: string;
  timeZone: string;
  timeoutSeconds?: number;
  process: () => Promise<void>;
}