
import { isOfType } from '@collabsoft-net/helpers';

import { eventListeners, responseListeners } from './Listeners';
import { Message } from './Types';

const responseHandler = (event: MessageEvent<string>) => {
  if (isOfType<Message<never>>(event.data, 'originId')) {
    const { name, originId, addonKey, key, data } = event.data;

    if (originId) {
      const callback = responseListeners.get(originId);
      if (callback) {
        responseListeners.delete(originId);
        callback(data);
      }
    }

    const eventHandlersOnce = Array.from(eventListeners).filter(([ , key]) => key && key.once);
    const eventHandlersAlways = Array.from(eventListeners).filter(([ , key ]) => !key || !key.once);

    eventHandlersOnce.forEach(([ listener, handler ]) => {
      if (!handler) {
        listener(data);
        eventListeners.delete(listener);
      } else if(handler.name === '*' || name === handler.name) {
        const mustEmit = !(addonKey && key) || !handler.filter || handler.filter(addonKey, key);
        if (mustEmit) {
          listener(data);
          eventListeners.delete(listener);
        }
      }
    });

    eventHandlersAlways.forEach(([ listener, handler ]) => {
      if (!handler) {
        listener(data);
      } else if(handler.name === '*' || name === handler.name) {
        const mustEmit = !(addonKey && key) || !handler.filter || handler.filter(addonKey, key);
        if (mustEmit) {
          listener(data);
        }
      }
    });
  }
};

export const initBridge = () => {
  window.removeEventListener('message', responseHandler);
  window.addEventListener('message', responseHandler);
}
