import { Events } from './Events';

export interface WindowWithMacroEditor extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tinymce?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AJS?: any;
}

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

export type HistoryGetStateRequest = {
  type?: 'hash'|'all';
}

export type HistoryGoRequest = {
  delta: number;
}

export type HistoryPushStateRequest = {
  newState: string;
  title?: string;
  url?: string;
}

export type HistoryReplaceStateRequest = {
  newState: string|Record<string, unknown>;
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

export type SaveMacroRequest<T> = {
  macroParameters: T;
  macroBody?: string | undefined;
}

export interface MacroEditorOptions {
  url: string;
  editTitle?: string;
  insertTitle?: string;
  height?: string;
  width?: string;
}
