
import { isProduction } from '@collabsoft-net/helpers';
import { PubSubHandler, ScheduledPubSubHandler } from '@collabsoft-net/types';
import { CronJob } from 'cron';
import * as functions from 'firebase-functions';
import { log } from 'firebase-functions/lib/logger';
import * as inversify from 'inversify';

export const PubSubHandlers = Symbol.for('PubSubHandlers');
export const ScheduledPubSubHandlers = Symbol.for('ScheduledPubSubHandlers');

export const registerPubSubHandlers = async (container: inversify.interfaces.Container | (() => inversify.interfaces.Container)): Promise<void> => {
  const appContainer = typeof container === 'function' ? container() : container;

  const pubSubHandlers = appContainer.isBound(PubSubHandlers) ? appContainer.getAll<PubSubHandler>(PubSubHandlers) : [];
  const scheduledPubSubHandlers = appContainer.isBound(ScheduledPubSubHandlers) ? appContainer.getAll<ScheduledPubSubHandler>(ScheduledPubSubHandlers) : [];

  pubSubHandlers.forEach(handler => {
    const name = handler.name || handler.topic;
    !isProduction() && log(`[${name}] Registering PubSub subscription for topic ${handler.topic}`)
    module.exports[name] = functions.runWith({ memory: '4GB', timeoutSeconds: 540 }).pubsub.topic(handler.topic).onPublish((message) => handler.process(message));
  });

  for await (const handler of scheduledPubSubHandlers) {
    const { name, schedule } = handler;
    if (!isProduction()) {
      log(`[${name}] Registering scheduled PubSub subscription for schedule ${schedule} (using Cron)`);
      const job = new CronJob(schedule, () => handler.process());
      job.start();
    } else {
      log(`[${name}] Registering scheduled PubSub subscription for schedule ${schedule} (using Google Cloud Scheduler)`);
      module.exports[name] = functions.runWith({ memory: '4GB', timeoutSeconds: 540 }).pubsub.schedule(schedule).onRun(() => handler.process());
    }
  }
}