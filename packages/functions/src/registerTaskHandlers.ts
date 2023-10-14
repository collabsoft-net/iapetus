
import { isOfType, isProduction } from '@collabsoft-net/helpers';
import { CustomEvent, TaskHandler, TenantAwareEvent } from '@collabsoft-net/types';
import { logger } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';
import { onTaskDispatched, TaskQueueOptions } from 'firebase-functions/v2/tasks';
import * as inversify from 'inversify';

export const TaskHandlers = Symbol.for('TaskHandlers');

export const registerTaskHandlers = (container: inversify.interfaces.Container | (() => inversify.interfaces.Container), options: TaskQueueOptions = {
  retryConfig: {
    maxAttempts: 3,
  },
  memory: '4GiB',
  timeoutSeconds: 1800
}) => {
  const appContainer = typeof container === 'function' ? container() : container;

  const taskHandlers = appContainer.isBound(TaskHandlers) ? appContainer.getAll<TaskHandler<TenantAwareEvent>>(TaskHandlers) : [];

  taskHandlers.forEach(handler => {
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
      !isProduction() && logger.log(`[${handler.name}] Registering Task ${handler.name} as function given that we running in emulator mode`)
      module.exports[handler.name] = onRequest(async (request, response) => {
        const event = request.body;
        if (isOfType<CustomEvent<TenantAwareEvent>>(event, 'data')) {
          await handler.process(event);
          response.sendStatus(200);
        } else {
          throw new Error('Request payload is invalid, expecting type of CustomEvent<TenantAwareEvent>');
        }
      })
    } else {
      !isProduction() && logger.log(`[${handler.name}] Registering Task ${handler.name}`)
      module.exports[handler.name] = onTaskDispatched<CustomEvent<TenantAwareEvent>>(handler.options || options, ({ data }) => handler.process(data))
    }
  });

}