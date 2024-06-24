import { HistoryGetStateRequest, HistoryGoRequest, HistoryPushStateRequest, HistoryReplaceStateRequest } from '../client/Types';
import { Host } from '../Host';

export const HistoryBackEventHandler = () => {
  window.history.back();
};

export const HistoryForwardEventHandler = () => {
  window.history.forward();
};

export const HistoryGetStateEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const { data } = event as MessageEvent<HistoryGetStateRequest>;
  const type = data.type || 'hash';

  const state = {
    hash: window.location.hash.replace('#!', ''),
    href: window.location.href,
    key: AC.options.appKey,
    title: document.title
  }

  if (type === 'hash') {
    AC.reply(event, state.hash);
  } else {
    AC.reply(event, state);
  }
};

export const HistoryGoEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const { data } = AC.toMessage<HistoryGoRequest>(event);
  if (data) {
    window.history.go(data.delta);
  }
};

export const HistoryPushStateEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const { data } = AC.toMessage<HistoryPushStateRequest>(event);
  if (data) {
    const newState = typeof data.newState === 'string' ? data.newState : new URLSearchParams(data.newState).toString();
    window.history.pushState(undefined, '', `#!${newState}`);
  }
};

export const HistoryReplaceStateEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const { data } = AC.toMessage<HistoryReplaceStateRequest>(event);
  if (data) {
    const newState = typeof data.newState === 'string' ? data.newState : new URLSearchParams(data.newState).toString();
    window.history.replaceState(undefined, '', `#!${newState}`);
  }
};