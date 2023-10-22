
import { isProduction } from '@collabsoft-net/helpers';
import { CustomEvent, PubSubHandler, ScheduledPubSubHandler, TenantAwareEvent } from '@collabsoft-net/types';
import { CronJob } from 'cron';
import { logger } from 'firebase-functions';
import { onMessagePublished,PubSubOptions } from 'firebase-functions/v2/pubsub';
import { onSchedule,ScheduleOptions } from 'firebase-functions/v2/scheduler';
import * as inversify from 'inversify';

const scheduledPubSubEmulatorJobs: Record<string, CronJob> = {};

export const PubSubHandlers = Symbol.for('PubSubHandlers');
export const ScheduledPubSubHandlers = Symbol.for('ScheduledPubSubHandlers');

export const registerPubSubHandlers = (container: inversify.interfaces.Container | (() => inversify.interfaces.Container), options: Partial<PubSubOptions>|Partial<ScheduleOptions> = { memory: '4GiB', timeoutSeconds: 540 }) => {
  const appContainer = typeof container === 'function' ? container() : container;

  const pubSubHandlers = appContainer.isBound(PubSubHandlers) ? appContainer.getAll<PubSubHandler<TenantAwareEvent>>(PubSubHandlers) : [];
  const scheduledPubSubHandlers = appContainer.isBound(ScheduledPubSubHandlers) ? appContainer.getAll<ScheduledPubSubHandler>(ScheduledPubSubHandlers) : [];

  pubSubHandlers.forEach(handler => {
    const name = handler.name || handler.topic;
    handler.timeoutSeconds = handler.timeoutSeconds || (typeof options.timeoutSeconds === 'number' ? options.timeoutSeconds : undefined)
    !isProduction() && logger.log(`[${name}] Registering PubSub subscription for topic ${handler.topic}`)
    module.exports[name] = onMessagePublished<CustomEvent<TenantAwareEvent>>({
      ...options,
      topic: handler.topic,
      timeoutSeconds: handler.timeoutSeconds
      }, (message) => handler.process(message));
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
      module.exports[name] = onSchedule({
        ...options,
        schedule,
        timeZone: handler.timeZone,
        timeoutSeconds: handler.timeoutSeconds
      }, () => handler.process());
    }
  });
}