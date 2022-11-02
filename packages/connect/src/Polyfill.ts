// The reason these unused vars are here is because they are placeholders
// They are taken from the AP / Connect documentation and can be used once the method is implemented
/* eslint-disable @typescript-eslint/no-unused-vars */

import uniqid from 'uniqid';

import { SupportedEvents } from './host/SupportedEvents';

const postMessage = (data?: unknown) => {
  const payload = data ? JSON.stringify(data) : '{}';
  window.parent.postMessage(payload, '*');
};

export const init = async (callback?: (err?: Error) => void): Promise<void> => {
  let count = 0;
  let connected = false;

  const requestId = uniqid();
  window.addEventListener('message', ({ data }) => {
    console.log('[AC] Received handshake response, connection established', data);
    connected = data && data.requestId === requestId;
  });

  console.log('[AC] Establishing connection to Atlassian Connect polyfill');
  while (!connected && count < 50) {
    count++;
    postMessage({ eventType: SupportedEvents.HANDSHAKE, name: 'handshake', requestId });
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (callback) {
    const err = !connected ? new Error('[AC] Failed to initialize connection to Atlassian Connect polyfill') : undefined;
    callback(err);
  }

  return connected ? Promise.resolve() : Promise.reject('[AC] Failed to initialize connection to Atlassian Connect polyfill');
};

const getLocation = (callback: (location: string) => void): void => {
  const requestId = uniqid();
  window.addEventListener('message', ({ data }) => {
    if (data && data.requestId === requestId) callback(data.location);
  });
  postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'getCustomData', requestId });
};

const resize = (width: string, height: string): void => {
  postMessage({ eventType: SupportedEvents.RESIZE, width, height });
};

const sizeToParent = (_hideFooter?: boolean): void => { throw new Error('sizeToParent(): This AP method is not yet implemented'); };
const hideFooter = (_hideFooter?: boolean): void => { throw new Error('hideFooter(): This AP method is not yet implemented'); };

const context: AP.Context = {
  getToken: async (callback?: (data: string) => string): Promise<string> => {
    callback && callback('');
    return Promise.resolve('');
  },
  getContext: <T> (callback?: (data: T) => void) => {
    const requestId = uniqid();
    const promise = new Promise<T>((resolve) => {
      window.addEventListener('message', ({ data }) => {
        if (data && data.requestId === requestId) {
          callback && callback(data.context);
          resolve(data.context);
        }
      });
    });
    postMessage({ eventType: SupportedEvents.CONTEXT_EVENT, name: 'getContext', requestId });
    return promise;
  },
};

const cookie: AP.Cookie = {
  saveLocalStorage: (): void => { throw new Error('saveLocalStorage(): This AP method is not yet implemented'); },
  readLocalStorage: (): string|undefined => { throw new Error('readLocalStorage(): This AP method is not yet implemented'); },
  save: (): void => { throw new Error('save(): This AP method is not yet implemented'); },
  read: (): void => { throw new Error('read(): This AP method is not yet implemented'); },
  erase: (): void => { throw new Error('erase(): This AP method is not yet implemented'); }
}

const events: AP.Events = {
  on: (_name: string, _listener: (data?: unknown) => void): void => { throw new Error('on(): This AP method is not yet implemented'); },
  onPublic: (_name: string, _listener: (data?: unknown) => void, _filter: (event: unknown) => boolean): void => { throw new Error('onPublic(): This AP method is not yet implemented'); },
  once: (_name: string, _listener: (data?: unknown) => void): void => { throw new Error('once(): This AP method is not yet implemented'); },
  oncePublic: (_name: string, _listener: (data?: unknown) => void, _filter: (event: unknown) => boolean): void => { throw new Error('oncePublic(): This AP method is not yet implemented'); },
  onAny: (_listener: (data?: unknown) => void): void => { throw new Error('onAny(): This AP method is not yet implemented'); },
  onAnyPublic: (_listener: (data?: unknown) => void, _filter: (event: unknown) => boolean): void => { throw new Error('onAnyPublic(): This AP method is not yet implemented'); },
  off: (_name: string, _listener: (data?: unknown) => void): void => { throw new Error('off(): This AP method is not yet implemented'); },
  offPublic: (_name: string, _listener: (data?: unknown) => void): void => { throw new Error('offPublic(): This AP method is not yet implemented'); },
  offAll: (_name: string): void => { throw new Error('offAll(): This AP method is not yet implemented'); },
  offAllPublic: (_name: string): void => { throw new Error('offAllPublic(): This AP method is not yet implemented'); },
  offAny: (_listener: (data?: unknown) => void): void => { throw new Error('offAny(): This AP method is not yet implemented'); },
  offAnyPublic: (_listener: (data?: unknown) => void): void => { throw new Error('offAnyPublic(): This AP method is not yet implemented'); },
  emit: (_name: string, _args?: Array<string>): void => { throw new Error('emit(): This AP method is not yet implemented'); },
  emitPublic: (_name: string, _args?: Array<string>): void => { throw new Error('emitPublic(): This AP method is not yet implemented'); }
};

const dialog: AP.Dialog = {
  create: <T> (dialogOptions: AP.DialogOptions<T>) => {
    const dialogId = uniqid();
    const options: AP.DialogOptions<T> = {
      chrome: false,
      size: 'medium',
      closeOnEscape: true,
      ...dialogOptions
    };
    postMessage({ eventType: SupportedEvents.DIALOG_CREATE, dialogId, options });
    return {
      on: <T> (name: string, listener: (data: T) => void) => {
        window.addEventListener('message', ({ data }) => {
          if (data && data.eventType && data.eventType === SupportedEvents.DIALOG_EVENT) {
            if (data.target === `${dialogId}_${name}`) {
              listener(data.customData);
            }
          }
        });
      }
    };
  },
  close: <T> (customData?: T) => {
    const frame = window.frameElement;
    if (frame) {
      const dialogId = frame.getAttribute('data-dialogid');
      postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'close', dialogId, customData });
    }
  },
  getCustomData: <T> (callback: (data: T) => void) => {
    const requestId = uniqid();
    window.addEventListener('message', ({ data }) => {
      if (data && data.requestId === requestId) callback(data.customData);
    });
    postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'getCustomData', requestId });
  },
  getButton: (name: 'cancel' | 'submit') => ({
    enable: () => postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'button', action: 'enable', type: name }),
    disable: () => postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'button', action: 'disable', type: name }),
    isEnabled: (callback: (isEnabled: boolean) => void) => {
      const requestId = uniqid();
      window.addEventListener('message', ({ data }) => {
        if (data && data.requestId === requestId) callback(data.isEnabled);
      });
      postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'button', action: 'isEnabled', type: name, requestId });
    },
    toggle: () => postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'button', action: 'toggle', type: name }),
    trigger: () => postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'button', action: 'trigger', type: name }),
    isHidden: (callback: (isHidden: boolean) => void) => {
      const requestId = uniqid();
      window.addEventListener('message', ({ data }) => {
        if (data && data.requestId === requestId) callback(data.isHidden);
      });
      postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'button', action: 'isHidden', type: name, requestId });
    },
    hide: () => postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'button', action: 'hide', type: name }),
    show: () => postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'button', action: 'show', type: name }),
    bind: (callback: () => void) => {
      const requestId = uniqid();
      window.addEventListener('message', ({ data }) => {
        if (data && data.requestId === requestId) callback();
      });
      postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'button', action: 'bind', type: name, requestId });
    }
  }),
  disableCloseOnSubmit: () => postMessage({ eventType: SupportedEvents.DIALOG_EVENT, name: 'disableCloseOnSubmit' }),
  createButton: (_options: AP.DialogButtonOptions): AP.DialogButton => { throw new Error('createButton(): This AP method is not yet implemented'); },
  isCloseOnEscape: (_callback: (isEnabled: boolean) => void): void => { throw new Error('isCloseOnEscape(): This AP method is not yet implemented'); },
  on: <T> (_event: string, _callback: (data?: T) => void): void => { throw new Error('on(): This AP method is not yet implemented'); }
};

const confluence: AP.Confluence = {
  saveMacro: (macroParameters: unknown, macroBody?: string) => {
    postMessage({ eventType: SupportedEvents.MACRO_EVENT, name: 'saveMacro', macroParameters, macroBody });
  },
  closeMacroEditor: () => {
    postMessage({ eventType: SupportedEvents.MACRO_EVENT, name: 'closeMacroEditor' });
  },
  getMacroData: <T> (callback: (data: T) => void) => {
    const requestId = uniqid();
    window.addEventListener('message', ({ data }) => {
      if (data && data.requestId === requestId) callback(data.macroData);
    });
    postMessage({ eventType: SupportedEvents.MACRO_EVENT, name: 'getMacroData', requestId });
  },
  getMacroBody: (_callback: (body: string) => void): void => { throw new Error('getMacroBody(): This AP method is not yet implemented'); },
  onMacroPropertyPanelEvent: (_eventBindings: { [ key: string ]: () => void }): void => { throw new Error('onMacroPropertyPanelEvent(): This AP method is not yet implemented'); },
  closeMacroPropertyPanel: (): void => { throw new Error('closeMacroPropertyPanel(): This AP method is not yet implemented'); },
  getContentProperty: (_key: string, _callback: (property: unknown) => void): void => { throw new Error('getContentProperty(): This AP method is not yet implemented'); },
  setContentProperty: (_contentProperty: AP.ConfluenceContentProperty, _callback: (result: { propery: AP.ConfluenceContentProperty, error: Error }) => void): void => { throw new Error('setContentProperty(): This AP method is not yet implemented'); },
  syncPropertyFromServer: (_key: string, _callback: (property: AP.ConfluenceContentProperty) => void): void => { throw new Error('syncPropertyFromServer(): This AP method is not yet implemented'); },
};

const flag: AP.Flag = {
  create: (_options: AP.FlagOptions): AP.FlagInstance => { throw new Error('create(): This AP method is not yet implemented'); }
};

const jira: AP.Jira = {};

const requireDeprecated = (): void => { throw new Error('require(): This AP method is not yet implemented'); };
const request = async (_urlOroptions: string | AP.RequestOptions, _options?: AP.RequestOptions): Promise<AP.RequestResponse> => { throw new Error('request(): This AP method is not yet implemented'); };

const history: AP.History = {
  back: (): void => { throw new Error('back(): This AP method is not yet implemented'); },
  forward: (): void => { throw new Error('forward(): This AP method is not yet implemented'); },
  go: (_delta: number): void => { throw new Error('go(): This AP method is not yet implemented'); },
  getState: (): string => { throw new Error('getState(): This AP method is not yet implemented'); },
  pushState: (_newState: Record<string, unknown>, _title?: string, _url?: string): void => { throw new Error('pushState(): This AP method is not yet implemented'); },
  replaceState: (_url: string): void => { throw new Error('replaceState(): This AP method is not yet implemented'); },
};

const host: AP.Host = {
  getSelectedText: (): void => { throw new Error('getSelectedText(): This AP method is not yet implemented'); },
}

const user: AP.User = {
  getCurrentUser: (): void => { throw new Error('getCurrentUser(): This AP method is not yet implemented'); },
  getTimeZone: (): void => { throw new Error('getTimeZone(): This AP method is not yet implemented'); },
  getLocale: (): void => { throw new Error('getLocale(): This AP method is not yet implemented'); },
}

const navigator: AP.Navigator = {
  getLocation: (callback: (location: AP.NavigatorLocation) => void) => {
    const requestId = uniqid();
    window.addEventListener('message', ({ data }) => {
      if (data && data.requestId === requestId) callback(data.location);
    });
    postMessage({ eventType: SupportedEvents.NAVIGATOR_EVENT, name: 'getLocation', requestId });
  },
  go: (target, context) => postMessage({ eventType: SupportedEvents.NAVIGATOR_EVENT, name: 'go', target, context }),
  reload: () => postMessage({ eventType: SupportedEvents.NAVIGATOR_EVENT, name: 'reload' })
};

const polyfill: AP.Instance = {
  getLocation,
  resize,
  sizeToParent,
  hideFooter,
  context,
  cookie,
  events,
  dialog,
  confluence,
  flag,
  jira,
  require: requireDeprecated,
  request,
  history,
  host,
  user,
  navigator,
  _data: {},
  isPolyfill: true
};

export const Polyfill = polyfill;

