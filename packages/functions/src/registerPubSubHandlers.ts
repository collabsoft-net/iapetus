
import { isProduction } from '@collabsoft-net/helpers';
import { getName, getParent, hasJob, scheduler } from '@collabsoft-net/scheduler';
import { PubSubHandler, ScheduledPubSubHandler, SystemEvent } from '@collabsoft-net/types';
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
      log(`[${name}] Registering scheduled PubSub subscription for schedule ${schedule}`);
      const scheduleName = getName('system', name);
      await hasJob(scheduleName).then((isTrue) => !isTrue
        ? scheduler.createJob({
            parent: getParent(),
            job: {
              name: scheduleName,
              schedule: schedule,
              httpTarget: {
                uri: `${process.env.AC_BASEURL}/api/scheduler`,
                httpMethod: 'POST',
                body: Buffer.from(JSON.stringify(new SystemEvent(name))),
              }
            }
          })
        : Promise.resolve(undefined)
      ).catch((error: Error) => {
        log(`[${name}] Failed to register scheduled PubSub subscription for schedule ${schedule}`, error);
      })
      module.exports[name] = functions.runWith({ memory: '4GB', timeoutSeconds: 540 }).pubsub.topic(name).onPublish(() => handler.process());
    if (!isProduction()) {
    } else {
      module.exports[name] = functions.runWith({ memory: '4GB', timeoutSeconds: 540 }).pubsub.schedule(schedule).onRun(() => handler.process());
    }
  }
}