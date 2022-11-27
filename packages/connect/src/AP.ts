/* eslint-disable @typescript-eslint/no-namespace */
// The reason these unused vars are here is because they are placeholders
// They are taken from the AP / Connect documentation and can be used once the method is implemented
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */

export {};

declare global {

  namespace AP {

    interface FrameOptions {
      resize?: boolean;
      sizeToParent?: boolean;
      margin?: boolean;
      base?: boolean;
    }

    interface Instance {
      getLocation(callback: (location: string) => void): void;
      resize(width: string, height: string): void;
      sizeToParent(hideFooter?: boolean): void;
      hideFooter(hideFooter?: boolean): void;

      context: AP.Context;
      cookie: AP.Cookie;
      events: AP.Events;
      dialog: AP.Dialog;
      confluence: AP.Confluence;
      flag: AP.Flag;
      jira: AP.Jira;

      require<T>(name: string, callback: (response: T) => void): void;
      request: AP.Request;

      history: AP.History;
      host: AP.Host;
      navigator: AP.Navigator;
      user: AP.User;

      _data: Record<string, unknown>;
      isPolyfill?: boolean;
    }

    interface Context {
      getToken: (callback?: () => string) => Promise<string>;
      getContext: <T> (callback?: (context: T) => unknown) => Promise<T>;
    }

    interface Cookie {
      saveLocalStorage: (addonKey: string, name: string, value: string, expireDays: number) => void;
      readLocalStorage: (addonKey: string, name: string) => string|undefined;
      save: (name: string, value: string, expires: number) => void;
      read: (name: string, callback: (value: string|undefined) => void) => void;
      erase: (name: string) => void;
    }

    interface JiraContext {
      jira: {
        issue: {
          id: string;
        },
        project: {
          id: string;
          key: string;
        }
      }
    }

    interface ConfluenceContext {
      confluence: {
        content: {
          id: string;
          type: string;
          version: string;
        }
        macro: {
          id: string;
          outputType: string;
          hash: string;
        }
        space: {
          key: string;
          id: string;
        }
      }
    }

    interface Confluence {
      saveMacro: (macroParameters: unknown, macroBody?: string) => void;
      closeMacroEditor: () => void;
      getMacroData: <T> (callback: (data: T) => void) => void;
      getMacroBody: (callback: (body: string) => void) => void;
      onMacroPropertyPanelEvent: (eventBindings: { [key: string]: () => void }) => void;
      closeMacroPropertyPanel: () => void;
      getContentProperty: (key: string, callback: (property: unknown) => void) => void;
      setContentProperty: (contentProperty: ConfluenceContentProperty, callback: (result: { propery: ConfluenceContentProperty, error: Error }) => void) => void;
      syncPropertyFromServer: (key: string, callback: (property: ConfluenceContentProperty) => void) => void;
    }

    interface Jira {
    }

    type ConfluenceContentProperty = {
      key: string;
      value: string|Record<string, unknown>;
      version: Record<string, unknown>;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/events/
    interface Events {
      on: (name: string, listener: (data?: unknown) => void) => void;
      onPublic: (name: string, listener: (data?: unknown) => void, filter: (event: unknown) => boolean) => void;
      once: (name: string, listener: (data?: unknown) => void) => void;
      oncePublic: (name: string, listener: (data?: unknown) => void, filter: (event: unknown) => boolean) => void;
      onAny: (listener: (data?: unknown) => void) => void;
      onAnyPublic: (listener: (data?: unknown) => void, filter: (event: unknown) => boolean) => void;
      off: (name: string, listener: (data?: unknown) => void) => void;
      offPublic: (name: string, listener: (data?: unknown) => void) => void;
      offAll: (name: string) => void;
      offAllPublic: (name: string) => void;
      offAny: (listener: (data?: unknown) => void) => void;
      offAnyPublic: (listener: (data?: unknown) => void) => void;
      emit: (name: string, args?: Array<string>) => void;
      emitPublic: (name: string, args?: Array<string>) => void;
    }

    // https://developer.atlassian.com/cloud/jira/software/jsapi/dialog/
    interface Dialog {
      create: <T> (options: DialogOptions<T>) => DialogReference;
      close: <T> (data?: T) => void;
      getCustomData: <T> (callback: (data: T) => void) => void;
      getButton: (name: 'cancel'|'submit') => DialogButton;
      disableCloseOnSubmit: () => void;
      createButton: (options: DialogButtonOptions) => DialogButton;
      isCloseOnEscape: (callback: (isEnabled: boolean) => void) => void;
      on: <T> (event: string, callback: (data?: T) => void) => void;
    }

    interface DialogReference {
      on: <T> (name: string, listener: (data?: T) => void) => void;
    }

    // https://developer.atlassian.com/cloud/jira/software/jsapi/classes/dialogoptions/
    interface DialogOptions<T> {
      key: string;
      size?: 'small'|'medium'|'large'|'x-large'|'fullscreen';
      width?: string;
      height?: string;
      chrome?: boolean;
      header?: string;
      submitText?: string;
      cancelText?: string;
      customData?: T;
      closeOnEscape?: boolean;
      buttons?: Array<DialogButtonOptions>;
      hint?: string;
    }

    // https://developer.atlassian.com/cloud/jira/software/jsapi/classes/dialogbutton/
    interface DialogButton {
      enable: () => void;
      disable: () => void;
      isEnabled: (callback: (isEnabled: boolean) => void) => void;
      toggle: () => void;
      trigger: () => void;
      isHidden: (callback: (isHidden: boolean) => void) => void;
      hide: () => void;
      show: () => void;
      bind: (callback: () => void) => void;
    }

    interface DialogButtonOptions {
      text: string,
      identifier: string;
    }

    interface Request {
      (url: string, options?: AP.RequestOptions): Promise<AP.RequestResponse>;
      (options: AP.RequestOptions): Promise<AP.RequestResponse>;
    }

    interface History {
      back: () => void;
      forward: () => void;
      go: (delta: number) => void;
      getState: () => string;
      pushState: (newState: Record<string, unknown>, title?: string, url?: string) => void;
      replaceState: (url: string) => void;
    }

    interface Host {
      getSelectedText: (callback: (selection: string) => void) => void;
    }

    interface User {
      getCurrentUser: (callback: (user: UserObject) => void) => void;
      getTimeZone: (callback: (timezone?: string) => void) => void;
      getLocale: (callback: (locale?: string) => void) => void;
    }

    interface UserObject {
      atlassianAccountId: string;
      accountType: 'atlassian'|'customer';
    }

    interface Navigator {
      getLocation: (callback: (location: NavigatorLocation) => void) => void;
      go: (target: NavigatorTargetJira|NavigatorTargetConfluence, context: NavigatorContext) => void;
      reload: () => void;
    }

    interface NavigatorLocation {
      target: 'contentview'|'contentedit';
      context: {
        contentId: number,
        contentType: string;
        spaceKey: string;
      };
      href: string;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/request/
    // https://bitbucket.org/atlassian/atlassian-connect-js-extra/src/master/packages/atlassian-connect-js-request/src/plugin/index.js
    interface RequestOptions {
      url: string;
      type?: string;
      cache?: boolean;
      data?: string;
      contentType?: string;
      experimental?: boolean;
      binaryAttachment?: boolean;
      headers?: RequestHeaders;
      success?: (responseText: string, statusText: string, xhr: RequestResponseXHRObject) => void;
      error?: (xhr: RequestResponseXHRObject, statusText: string, errorThrown: Error) => void;
    }

    interface RequestHeaders {
      [key: string]: string;
    }

    interface RequestResponse {
      body: string;
      xhr: RequestResponseXHRObject;
    }

    interface RequestResponseError {
      err: Error;
      xhr: RequestResponseXHRObject
    }

    interface RequestResponseXHRObject {
      getAllResponseHeaders: () => string;
      getResponseHeader: (name: string) => string;
      status: number;
      statusText: string;
    }

    interface Flag {
      create: (options: FlagOptions) => FlagInstance;
    }

    interface FlagInstance {
      close: () => void;
      _cls: string;
      _id: string;
    }

    interface FlagOptions {
      title: string;
      body: string;
      type?: FlagTypeOptions;
      close: FlagCloseOptions;
      actions?: {
        [actionIdentifier: string]: string;
      }
    }

    type FlagTypeOptions = 'info'|'success'|'warning'|'error';
    type FlagCloseOptions = 'manual'|'auto';

    type NavigatorTargetJira = 'dashboard'|'issue'|'addonModule'|'userProfile'|'projectAdminSummary'|'projectAdminTabPanel'|'site';
    type NavigatorTargetConfluence = 'contentview'|'contentedit'|'spaceview'|'spacetools'|'dashboard'|'userProfile'|'addonModule'|'contentlist'|'site';

    interface NavigatorContext {
      contentId?: string;
      contentType?: string;
      spaceKey?: string;
      username?: string;
      userAccountId?: string;
      addonKey?: string;
      moduleKey?: string;
      dashboardId?: string;
      projectKey?: string;
      issueKey?: string;
      adminPageKey?: string;
      projectId?: string;
      customData?: Record<string, string|number>;
      versionOverride?: string;
      embeddedContentRender?: string;
      relativeUrl?: string;
      absoluteUrl?: string;
    }

  }

}