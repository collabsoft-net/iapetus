import uniqid from 'uniqid';

import { Events } from './Events';
import { responseListeners } from './Listeners';
import { CallbackHandler, Message } from './Types';

export function postMessage(name: Events): string;
export function postMessage<T>(name: Events, data: T): string;
export function postMessage<X>(name: Events, callback: CallbackHandler<X>): string;
export function postMessage<T, X>(name: Events, data: T, callback: CallbackHandler<X>): string;
export function postMessage<T, X> (name: Events, data: T, callback?: CallbackHandler<X>): string;
export function postMessage<T extends Record<string, unknown>, X> (name: Events, dataOrCallback?: T|CallbackHandler<X>, callback?: CallbackHandler<X>): string {
  const originId = uniqid();

  const data = typeof dataOrCallback !== 'function' ? dataOrCallback : undefined;
  const responseHandler = typeof dataOrCallback === 'function' ? dataOrCallback : callback;

  if (responseHandler) {
    responseListeners.set(originId, responseHandler);
  }

  const payload: Message<T> = { name, originId, data };
  window.parent.postMessage(payload, '*');
  return originId;
}
