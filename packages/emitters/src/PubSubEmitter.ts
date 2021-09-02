'use strict';

// ------------------------------------------------------------------------------------------ Dependencies

import { EntityEvent, Event, EventEmitter, EventListener, PubSubMessage, PubSubOptions } from '@collabsoft-net/types';
import { Attributes, PubSub, Subscription, Topic } from '@google-cloud/pubsub';
import * as fs from 'fs';
import uniqid from 'uniqid';

// ------------------------------------------------------------------------------------------ Class

export class PubSubEmitter implements EventEmitter {

  private client: PubSub;

  constructor(options: PubSubOptions) {
    // Initialize the client
    this.client = new PubSub({
      projectId: options.projectId,
    });

    if (options.apiKey) {
      // We need to write the API key to disk because Google can only authenticate from file
      const keyFilename = `/tmp/${uniqid()}.json`;
      fs.writeFileSync(keyFilename, Buffer.from(options.apiKey, 'base64').toString('utf-8'), 'utf-8');
      this.client.options.keyFilename = keyFilename;
    }
  }

  async on(event: string|typeof Event, listener: EventListener): Promise<void> {
    event = typeof event === 'string' ? event : event.name;
    try {
      const subscription = await this.getSubscription(event);
      subscription.on('message', async (message: PubSubMessage) => {
        try {
          const event: Event|EntityEvent = JSON.parse(Buffer.from(message.data).toString('utf-8'));
          await listener(event);
          message.ack();
        } catch (error) {
          console.error(`Failed to process message with ID ${message.id}`, error);
          message.nack();
        }
      });
    } catch (error) {
      console.error(`Failed to subscribe to event ${event}`);
      console.error(error);
    }
  }

  async emit(event: Event): Promise<void> {
    const publisher = await this.getPublisher(event.name);

    let attributes: Attributes = {};
    if (event.attributes && event.attributes instanceof Map) {
      event.attributes.forEach((value: string, key: string) => attributes[key] = value);
    } else {
      attributes = event.attributes || {};
    }

    publisher.publish(Buffer.from(JSON.stringify(event)), attributes);
  }

  private async getPublisher(topicName: string) {
    const topic = await this.getTopic(topicName);
    return topic.publisher;
  }

  private async getSubscription(topicName: string): Promise<Subscription> {
    const topic = await this.getTopic(topicName);
    let subscription = topic.subscription(topicName);
    let exists = false;
    let count = 0;

    while (!exists) {
      if (count >= 10) {
        throw new Error(`Could not create subscription for topic ${topicName}: timeout`);
      }

      try {
        const data = await subscription.exists();
        exists = data[0];

        if (!exists) {
          const subscriptions = await topic.createSubscription(topicName);
          subscription = subscriptions[0];
        } else {
          subscription = topic.subscription(topicName);
        }
      } catch (error) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      } finally {
        count++;
      }
    }

    return subscription;
  }

  private async getTopic(topicName: string): Promise<Topic> {
    let topic = this.client.topic(topicName);
    let exists = false;
    let count = 0;

    while (!exists) {
      if (count >= 10) {
        throw new Error(`Could not create topic ${topicName}: timeout`);
      }

      try {
        const data = await topic.exists();
        exists = data[0];

        if (!exists) {
          const topics = await topic.create();
          topic = topics[0];
        }
      } catch (error) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      } finally {
        count++;
      }
    }

    return topic;
  }

}
