import { Events } from './Events';

export type CallbackHandler<X> = (data?: X) => void;

export type Message<T> = {
  name: Events;
  originId: string;
  addonKey?: string|null;
  key?: string|null;
  data?: T;
}

export type CookieSaveRequest = {
  name: string;
  value: string;
  expires: number;
}

export type CookieReadRequest = {
  name: string;
}

export type CookieReadResponse = {
  value: string | undefined;
}

export type CookieEraseRequest = {
  name: string;
}

export type DialogCloseRequest<T> = {
  data: T | undefined;
}

export type DialogButtonRequest = {
  name: 'cancel'|'submit'|string,
  action: 'enable'|'disable'|'isEnabled'|'toggle'|'trigger'|'isHidden'|'hide'|'show'|'bind';
}

export type EventsEmitRequest = {
  name: string;
  args: Array<string> | undefined;
}

export type NavigatorGoRequest = {
  target: AP.NavigatorTargetJira|AP.NavigatorTargetConfluence;
  context: AP.NavigatorContext;
}

export type ResizeRequest = {
  width: string;
  height: string;
}
