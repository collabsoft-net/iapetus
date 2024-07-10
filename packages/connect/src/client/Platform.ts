
import { isOfType } from '@collabsoft-net/helpers';
import axios, { AxiosError,Method } from 'axios';

import { Events } from './Events';
import { eventListeners } from './Listeners';
import { postMessage } from './PostMessage';
import { InitializeThemingEventHandler } from './Theming';
import { CookieEraseRequest, CookieReadRequest, CookieReadResponse, CookieSaveRequest, DialogButtonRequest, ResizeRequest } from './Types';

// We are defining AP.history.getState() here because it has a weird overload
// Unfortunately, typescript does not support overload declaration within an object
// We are also diverting from the original API, because we cannot support synchronous access
// This is because Atlassian uses the iframe `name` attribute to pass data and allows synchronous access
// Our implementation relies solely on postMessage, which is async by nature
function getState(): string|AP.HistoryState;
function getState(type: 'hash'|'all'|undefined): string|AP.HistoryState;
function getState(type: 'hash'|'all'|undefined, callback: (state?: string|AP.HistoryState) => void): string|AP.HistoryState;
function getState(type?: 'hash'|'all', callback?: (state?: string|AP.HistoryState) => void): string|AP.HistoryState {
  if (!callback) {
    throw new Error('[AP] the synchronous variant of AP.history.getState() has not been implemented in the polyfill');
  }

  postMessage(Events.AP_HISTORY_GETSTATE, { type }, (data?: string|AP.HistoryState) => {
    callback && callback(data);
  });

  // We should not reach this, but if we do, we need to return something to match the AP typings
  return '';
}

// We are defining AP.request here because it has a constructor
// Unfortunately, Typescript does not support object method constructors
async function request(url: string, options?: AP.RequestOptions): Promise<AP.RequestResponse>;
async function request(options: AP.RequestOptions): Promise<AP.RequestResponse>;
async function request(urlOrOptions: string|AP.RequestOptions, options?: AP.RequestOptions): Promise<AP.RequestResponse|AP.RequestResponseError> {

  const url = typeof urlOrOptions === 'string' ? urlOrOptions : urlOrOptions.url;
  options = typeof urlOrOptions !== 'string' ? urlOrOptions : {
    url: url,
    type: 'get',
    cache: false,
    data: undefined,
    contentType: 'application/json',
    experimental: false,
    binaryAttachment: false,
    headers: {}
  }

  if (options.cache) {
    console.warn('[AP] The AP polyfill does not support the "cache" option of AP.request()');
  }

  try {
    const response = await axios(url, {
      method: (options.type || 'get') as Method,
      data: options.data,
      headers: {
        ...options.headers,
        ...options.experimental ? {
          'X-ExperimentalApi': 'true'
        } : {},
        ...options.contentType ? {
          'content-type': options.contentType
        } : {}
      },
      responseType: options.binaryAttachment ? 'arraybuffer' : 'json'
    });

    if (options.success && response.status >= 200 && response.status <= 299) {
      options.success(JSON.stringify(response.data), response.statusText, response.request);
    }

    if (options.error && response.status >= 400 && response.status <= 599) {
      options.error(response.request, response.statusText, new Error());
    }

    return {
      body: JSON.stringify(response.data),
      xhr: response.request
    }
  } catch (err) {
    if (isOfType<AxiosError>(err, 'isAxiosError')) {
      if (options.error) {
        options.error(err.request, err.response?.statusText || '', err);
      }

      return {
        err,
        xhr: err.request
      }
    } else {
      throw err;
    }
  }
}

/***********************************************************************
 *
 * AP (Platform)
 * This is the platform agnostic implemenentation of AP
 * It has everything except for Jira / Confluence specific methods
 *
 *********************************************************************** */
export const PlatformInstance: AP.PlatformInstance = {

  // Convenience method for indicating this is a polyfill
  isPolyfill: true,

  /***********************************************************************
   *
   * AP.context
   *
   *********************************************************************** */

  context: {
    getToken: function (callback?: ((token: string) => string) | undefined): Promise<string> {
      callback && callback('');
      return Promise.resolve('');
    }
  },

  /***********************************************************************
   *
   * AP.cookie
   *
   *********************************************************************** */

  cookie: {
    save: function (name: string, value: string, expires: number): void {
      postMessage<CookieSaveRequest>(Events.AP_COOKIE_SAVE, { name, value, expires });
    },
    read: function (name: string, callback: (value: string | undefined) => void): void {
      postMessage<CookieReadRequest, CookieReadResponse>(Events.AP_COOKIE_READ, { name }, (data) => callback(data?.value));
    },
    erase: function (name: string): void {
      postMessage<CookieEraseRequest>(Events.AP_COOKIE_ERASE, { name });
    }
  },

  /***********************************************************************
   *
   * AP.dialog
   *
   *********************************************************************** */

  dialog: {
    create: function <T>(options: AP.DialogOptions<T>): AP.DialogReference {
      postMessage(Events.AP_DIALOG_CREATE, options);

      return {
        on: <T> (name: string, listener: (data?: T) => void) => {
          eventListeners.set(listener, {
            name: `dialog.${name}`,
            once: true,
            listener
          });
        }
      };
    },
    close: function <T>(data?: T | undefined): void {
      postMessage(Events.AP_DIALOG_CLOSE, data);
    },
    getCustomData: function <T>(callback: (data?: T) => void): void {
      postMessage(Events.AP_DIALOG_GETCUSTOMDATA, (data?: T) => callback(data));
    },
    getButton: function (name: 'cancel' | 'submit'): AP.DialogButton {
      return {
        enable: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'enable' }),
        disable: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'disable' }),
        isEnabled: (callback: (isEnabled: boolean) => void) => postMessage<DialogButtonRequest, boolean>(Events.AP_DIALOG_GETBUTTON, { name, action: 'isEnabled' }, (data) =>  callback(data || false)),
        toggle: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'toggle' }),
        trigger: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'trigger' }),
        isHidden: (callback: (isHidden: boolean) => void) => postMessage<DialogButtonRequest, boolean>(Events.AP_DIALOG_GETBUTTON, { name, action: 'isHidden' }, (data) =>  callback(data || false)),
        hide: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'hide' }),
        show: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'show' }),
        bind: (callback: () => void) => postMessage<DialogButtonRequest, () => void>(Events.AP_DIALOG_GETBUTTON, { name, action: 'bind' }, () => callback())
      }
    },
    disableCloseOnSubmit: function (): void {
      postMessage(Events.AP_DIALOG_DISABLECLOSEONSUBMIT);
    },
    createButton: function (options: AP.DialogButtonOptions): AP.DialogButton {
      postMessage(Events.AP_DIALOG_CREATEBUTTON, { options })
      const name = options.identifier;
      return {
        enable: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'enable' }),
        disable: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'disable' }),
        isEnabled: (callback: (isEnabled: boolean) => void) => postMessage<DialogButtonRequest, boolean>(Events.AP_DIALOG_GETBUTTON, { name, action: 'isEnabled' }, (data) =>  callback(data || false)),
        toggle: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'toggle' }),
        trigger: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'trigger' }),
        isHidden: (callback: (isHidden: boolean) => void) => postMessage<DialogButtonRequest, boolean>(Events.AP_DIALOG_GETBUTTON, { name, action: 'isHidden' }, (data) =>  callback(data || false)),
        hide: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'hide' }),
        show: () => postMessage<DialogButtonRequest>(Events.AP_DIALOG_GETBUTTON, { name, action: 'show' }),
        bind: (callback: () => void) => postMessage<DialogButtonRequest, () => void>(Events.AP_DIALOG_GETBUTTON, { name, action: 'bind' }, () => callback())
      }
    },
    isCloseOnEscape: function (callback: (isCloseOnEscape: boolean) => void): void {
      postMessage(Events.AP_DIALOG_ISCLOSEONESCAPE, (data?: { isCloseOnEscape: boolean }) =>  callback(data?.isCloseOnEscape || false))
    }
  },

  /***********************************************************************
   *
   * AP.events
   *
   *********************************************************************** */

  events: {
    on: function (name: string, listener: (data?: Array<string>) => void): void {
      eventListeners.set(listener, { name, listener });
    },
    onPublic: function (name: string, listener: (data?: Array<string>) => void, filter: (addonKey: string, key: string) => boolean): void {
      eventListeners.set(listener, { name, listener, filter });
    },
    once: function (name: string, listener: (data?: Array<string>) => void): void {
      eventListeners.set(listener, { name, once: true, listener });
    },
    oncePublic: function (name: string, listener: (data?: Array<string>) => void, filter: (addonKey: string, key: string) => boolean): void {
      eventListeners.set(listener, { name, once: true, listener, filter });
    },
    onAny: function (listener: (data?: Array<string>) => void): void {
      eventListeners.set(listener, undefined);
    },
    onAnyPublic: function (listener: (data?: Array<string>) => void, filter: (addonKey: string, key: string) => boolean): void {
      eventListeners.set(listener, { name: '*', listener, filter });
    },
    off: function (name: string, listener: (data?: Array<string>) => void): void {
      eventListeners.forEach((handler, key ) => {
        if (handler && handler.name === name) {
          if (key === listener) {
            eventListeners.delete(key);
          }
        }
      });
    },
    offPublic: function (name: string, listener: (data?: Array<string>) => void): void {
      eventListeners.forEach((handler, key ) => {
        if (handler && handler.name === name && handler.filter) {
          if (key === listener) {
            eventListeners.delete(key);
          }
        }
      });
    },
    offAll: function (name: string): void {
      eventListeners.forEach((handler, key ) => {
        if (handler && handler.name === name) {
          eventListeners.delete(key);
        }
      });
    },
    offAllPublic: function (name: string): void {
      eventListeners.forEach((handler, key ) => {
        if (handler && handler.name === name && handler.filter) {
          eventListeners.delete(key);
        }
      });
    },
    offAny: function (listener: (data?: Array<string>) => void): void {
      eventListeners.delete(listener);
    },
    offAnyPublic: function (listener: (data?: Array<string>) => void): void {
      eventListeners.forEach((handler, key ) => {
        if (handler && handler.filter) {
          if (key === listener) {
            eventListeners.delete(key);
          }
        }
      });
    },
    emit: function (name: string, args?: string[] | undefined): void {
      postMessage(Events.AP_EVENTS_EMIT, { name, args });
    },
    emitPublic: function (name: string, args?: string[] | undefined): void {
      postMessage(Events.AP_EVENTS_EMIT, { name, args, public: true });
    }
  },

  /***********************************************************************
   *
   * AP.flag
   *
   *********************************************************************** */

  flag: {
    create: function (options: AP.FlagOptions): AP.FlagInstance {
      const flagId = postMessage(Events.AP_FLAG_CREATE, options);
      return {
        close: () => postMessage(Events.AP_FLAG_CLOSE, { flagId }),
        _id: flagId
      }
    }
  },


  /***********************************************************************
   *
   * AP.history
   *
   *********************************************************************** */

  history: {
    back: function (): void {
      postMessage(Events.AP_HISTORY_BACK);
    },
    forward: function (): void {
      postMessage(Events.AP_HISTORY_FORWARD);
    },
    go: function (delta: number): void {
      postMessage(Events.AP_HISTORY_GO, { delta });
    },
    getState,
    pushState: function (newState: string): void {
      postMessage(Events.AP_HISTORY_PUSHSTATE, { newState });
    },
    replaceState: function (newState: string|Record<string, string>): void {
      postMessage(Events.AP_HISTORY_REPLACESTATE, { newState });
    },
    popState: function (handler: (state: AP.HistoryPopState) => void): void {
      postMessage(Events.AP_HISTORY_POPSTATE, (data?: AP.HistoryPopState) => data && handler(data));
    },
  },

  /***********************************************************************
   *
   * AP.iframe
   *
   *********************************************************************** */

  getLocation: function (callback: (location: string) => void): void {
    postMessage(Events.AP_IFRAME_GETLOCATION, callback);
  },
  resize: function (width: string, height: string): void {
    postMessage<ResizeRequest>(Events.AP_IFRAME_RESIZE, { width, height });
  },
  sizeToParent: function (hideFooter?: boolean | undefined): void {
    postMessage(Events.AP_IFRAME_SIZETOPARENT, { hideFooter });
  },

  /***********************************************************************
   *
   * AP.inlineDialog
   *
   *********************************************************************** */

  inlineDialog: {
    hide: function (): void {
      postMessage(Events.AP_INLINEDIALOG_HIDE);
    }
  },

  /***********************************************************************
   *
   * AP.navigator
   *
   *********************************************************************** */

  navigator: {
    reload: function (): void {
      postMessage(Events.AP_NAVIGATOR_RELOAD);
    }
  },

  /***********************************************************************
   *
   * AP.page
   *
   *********************************************************************** */

  page: {
    setTitle: function (title: string): void {
      postMessage(Events.AP_PAGE_SETTITLE, { title });
    }
  },

  /***********************************************************************
   *
   * AP.request
   *
   *********************************************************************** */

  request,

  /***********************************************************************
   *
   * AP.scrollPosition
   *
   *********************************************************************** */

  scrollPosition: {
    getPosition: function (callback: (obj: unknown) => void): void {
      postMessage(Events.AP_SCROLLPOSITION_GETPOSITION, callback);
    },
    setVerticalPosition: function (y: number, callback: (obj: unknown) => void): void {
      postMessage(Events.AP_SCROLLPOSITION_SETVERTICALPOSITION, { y }, callback);
    }
  },

  /***********************************************************************
   *
   * AP.theming
   *
   *********************************************************************** */

  theming: {
    initializeTheming: function (): void {
      InitializeThemingEventHandler();
    }
  },

  /***********************************************************************
   *
   * AP.user
   *
   *********************************************************************** */

  user: {
    getCurrentUser: function (callback: (user: AP.UserObject) => void): void {
      postMessage(Events.AP_USER_GETCURRENTUSER, callback);
    },
    getTimeZone: function (callback: (timezone: string) => void): void {
      postMessage(Events.AP_USER_GETTIMEZONE, callback);
    },
    getLocale: function (callback: (locale?: string | undefined) => void): void {
      postMessage(Events.AP_USER_GETLOCALE, callback);
    }
  },
}
