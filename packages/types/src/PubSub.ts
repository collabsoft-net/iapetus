import { pubsub } from 'firebase-functions';

export interface PubSubOptions {
  projectId: string;
  apiKey?: string;
}

export interface PubSubMessage {
  id: string;
  ackId: string;
  data: Buffer;
  attributes: unknown;
  timestamp: number;
  ack: () => void;
  nack: () => void;
}

export interface PubSubHandler {
  name?: string;
  topic: string;
  timeoutSeconds?: number;
  process: (message: pubsub.Message) => Promise<void>;
}

export interface ScheduledPubSubHandler {
  name: string;
  schedule: string;
  timeZone: string;
  timeoutSeconds?: number;
  process: () => Promise<void>;
}