
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