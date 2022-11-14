
import { isProduction } from '@collabsoft-net/helpers';
import { PubSubHandler, ScheduledPubSubHandler } from '@collabsoft-net/types';
import { CronJob } from 'cron';
import * as functions from 'firebase-functions';
import { RuntimeOptions } from 'firebase-functions';
import { logger } from 'firebase-functions';
import * as inversify from 'inversify';

const scheduledPubSubEmulatorJobs: Record<string, CronJob> = {};

export const PubSubHandlers = Symbol.for('PubSubHandlers');
export const ScheduledPubSubHandlers = Symbol.for('ScheduledPubSubHandlers');

export const registerPubSubHandlers = (container: inversify.interfaces.Container | (() => inversify.interfaces.Container), options: RuntimeOptions = { memory: '4GB', timeoutSeconds: 540 }) => {
  const appContainer = typeof container === 'function' ? container() : container;

  const pubSubHandlers = appContainer.isBound(PubSubHandlers) ? appContainer.getAll<PubSubHandler>(PubSubHandlers) : [];
  const scheduledPubSubHandlers = appContainer.isBound(ScheduledPubSubHandlers) ? appContainer.getAll<ScheduledPubSubHandler>(ScheduledPubSubHandlers) : [];

  pubSubHandlers.forEach(handler => {
    const name = handler.name || handler.topic;
    handler.timeoutSeconds = handler.timeoutSeconds || (typeof options.timeoutSeconds === 'number' ? options.timeoutSeconds : undefined)
    !isProduction() && logger.log(`[${name}] Registering PubSub subscription for topic ${handler.topic}`)
    module.exports[name] = functions
      .runWith({
        ...options,
        timeoutSeconds: handler.timeoutSeconds
      })
      .pubsub
      .topic(handler.topic)
      .onPublish((message) => handler.process(message));
  });

  scheduledPubSubHandlers.forEach(handler => {
    const { name, schedule } = handler;
    if (!isProduction()) {
      logger.log(`[${name}] Registering scheduled PubSub subscription for schedule ${schedule} (using Cron)`);
      if (!scheduledPubSubEmulatorJobs[name]) {
        const job = new CronJob(schedule, () => handler.process());
        scheduledPubSubEmulatorJobs[name] = job;
        job.start();
      }
    } else {
      logger.log(`[${name}] Registering scheduled PubSub subscription for schedule ${schedule} (using Google Cloud Scheduler)`);
      handler.timeoutSeconds = handler.timeoutSeconds || (typeof options.timeoutSeconds === 'number' ? options.timeoutSeconds : undefined)
      module.exports[name] = functions
        .runWith({
          ...options,
          timeoutSeconds: handler.timeoutSeconds
        })
        .pubsub
        .schedule(schedule)
        .timeZone(handler.timeZone)
        .onRun(() => handler.process());
    }
  });
}