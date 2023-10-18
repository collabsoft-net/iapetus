
import { isProduction } from '@collabsoft-net/helpers';
import { CustomEvent, TaskHandler, TenantAwareEvent } from '@collabsoft-net/types';
import { logger } from 'firebase-functions';
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
    !isProduction() && logger.log(`[${handler.name}] Registering Task ${handler.name}`)
    module.exports[handler.name] = onTaskDispatched<CustomEvent<TenantAwareEvent>>({ ...options, ...(handler.options || {}) }, ({ data }) => handler.process(data))
  });

}