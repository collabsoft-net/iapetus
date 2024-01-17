/* eslint-disable @typescript-eslint/no-namespace */
// The reason these unused vars are here is because they are placeholders
// They are taken from the AP / Connect documentation and can be used once the method is implemented
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */

export {};

export type WindowWithAP<T = AP.JiraInstance|AP.ConfluenceInstance> = Window & {
  AP: T;
}

declare global {

  namespace AP {

    interface FrameOptions {
      resize?: boolean;
      sizeToParent?: boolean;
      margin?: boolean;
      base?: boolean;
    }

    type JiraInstance = PlatformInstance & {
      jira: Jira;
      context: Context & {
        getContext: (callback?: (context: JiraContext) => void) => Promise<JiraContext>;
      }
      navigator: Navigator & {
        go: (target: NavigatorTargetJira, context: NavigatorContext) => void;
      }
    }

    type ConfluenceInstance = PlatformInstance & {
      confluence: Confluence;

      context: Context & {
        getContext: (callback?: (context: ConfluenceContext) => void) => Promise<ConfluenceContext>;
      }

      // This is specific to Confluence, but it's not in AP.confluence
      customContent: CustomContent;

      navigator: Navigator & {
        getLocation: (callback: (location: NavigatorLocation) => void) => void;
        go: (target: NavigatorTargetConfluence, context: NavigatorContext) => void;
      }
    }

    // https://developer.atlassian.com/cloud/jira/platform/about-the-connect-javascript-api/
    // https://developer.atlassian.com/cloud/confluence/about-the-connect-javascript-api/
    interface PlatformInstance {

      context: Context;
      cookie: Cookie;
      dialog: Dialog;
      events: Events;
      flag: Flag;
      history: History;

      // This is located under iframe, but it is actually on the AP object itself
      // https://developer.atlassian.com/cloud/jira/platform/jsapi/iframe/
      // https://developer.atlassian.com/cloud/confluence/jsapi/iframe/
      getLocation(callback: (location: string) => void): void;
      resize(width: string, height: string): void;
      sizeToParent(hideFooter?: boolean): void;

      inlineDialog: InlineDialog;
      navigator: Navigator;
      page: Page;

      // This is located under request, but it is actually on the AP object itself
      request: Request;

      scrollPosition: ScrollPosition;
      theming: Theming;
      user: User;

      // This is an undocumented feature of AP
      // Object data has been extracted from inspection, but is unreliable
      _data?: Record<string, unknown>;

      // Convenience method to know whether the implementation is a polyfill
      isPolyfill?: boolean;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/context/
    // https://developer.atlassian.com/cloud/confluence/jsapi/context/
    type Context = {
      getToken: (callback?: (token: string) => string) => Promise<string>;
    }

    // Unfortunately, this is undocumented
    // The typings were extracted from browser inspection, and as a result are unreliable
    type JiraContext = {
      jira: {
        issue: {
          id: string;
          key: string;
        },
        project: {
          id: string;
          key: string;
        }
      }
    }

    // Unfortunately, this is undocumented
    // The typings were extracted from browser inspection, and as a result are unreliable
    type ConfluenceContext = {
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

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/cookie/
    // https://developer.atlassian.com/cloud/confluence/jsapi/cookie/
    type Cookie = {
      save: (name: string, value: string, expires: number) => void;
      read: (name: string, callback: (value: string|undefined) => void) => void;
      erase: (name: string) => void;
    }

    // This is specific to Confluence, but it's not in AP.confluence
    // https://developer.atlassian.com/cloud/confluence/jsapi/custom-content/
    type CustomContent = {
      getEditComponent: () => CustomContentEditComponent;
    }

    type CustomContentEditComponent = {
      intercept: (event: string) => void;
      submitCallback: (value: CustomContentObject|string|false) => void;
      submitSuccessCallback: (status: boolean, message?: string) => void;
      submitErrorCallback: (status: boolean, message?: string) => void;
      cancelCallback: (status: boolean, message?: string) => void;
    }

    type CustomContentObject = {
      type: string;
      title: string;
      space: {
        key: string;
      }
      body: object;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/dialog/
    // https://developer.atlassian.com/cloud/confluence/jsapi/dialog/
    type Dialog = {
      create: <T> (options: DialogOptions<T>) => DialogReference;
      close: <T> (data?: T) => void;
      getCustomData: <T> (callback: (data?: T) => void) => void;
      getButton: (name: 'cancel'|'submit') => DialogButton;
      disableCloseOnSubmit: () => void;
      createButton: (options: DialogButtonOptions) => DialogButton;
      isCloseOnEscape: (callback: (isCloseOnEscape: boolean) => void) => void;
    }

    type DialogReference = {
      on: <T> (name: string, listener: (data?: T) => void) => void;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/classes/dialogoptions/
    // https://developer.atlassian.com/cloud/confluence/jsapi/classes/dialogoptions/
    type DialogOptions<T> = {
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

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/classes/dialogbutton/
    // https://developer.atlassian.com/cloud/confluence/jsapi/classes/dialogbutton/
    type DialogButton = {
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

    type DialogButtonOptions = {
      text: string,
      identifier: string;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/events/
    // https://developer.atlassian.com/cloud/confluence/jsapi/events/
    type Events = {
      on: <T> (name: string, listener: (data?: Array<string>) => void) => void;
      onPublic: <T> (name: string, listener: (data?: Array<string>) => void, filter: (addonKey: string, key: string) => boolean) => void;
      once: <T> (name: string, listener: (data?: Array<string>) => void) => void;
      oncePublic: <T> (name: string, listener: (data?: Array<string>) => void, filter: (addonKey: string, key: string) => boolean) => void;
      onAny: <T> (listener: (data?: Array<string>) => void) => void;
      onAnyPublic: <T> (listener: (data?: Array<string>) => void, filter: (addonKey: string, key: string) => boolean) => void;
      off: <T> (name: string, listener: (data?: Array<string>) => void) => void;
      offPublic: <T> (name: string, listener: (data?: Array<string>) => void) => void;
      offAll: (name: string) => void;
      offAllPublic: (name: string) => void;
      offAny: <T> (listener: (data?: Array<string>) => void) => void;
      offAnyPublic: <T> (listener: (data?: Array<string>) => void) => void;
      emit: (name: string, args?: Array<string>) => void;
      emitPublic: (name: string, args?: Array<string>) => void;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/flag/
    // https://developer.atlassian.com/cloud/confluence/jsapi/flag/
    type Flag = {
      create: (options: FlagOptions) => FlagInstance;
    }

    type FlagOptions = {
      title: string;
      body?: string;
      type?: FlagTypeOptions;
      close?: FlagCloseOptions;
      actions?: {
        [actionIdentifier: string]: string;
      }
    }

    type FlagTypeOptions = 'info'|'success'|'warning'|'error';
    type FlagCloseOptions = 'manual'|'auto';

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/classes/flag/
    // https://developer.atlassian.com/cloud/confluence/jsapi/classes/flag/
    type FlagInstance = {
      close: () => void;
      _id: string;
    }

    // Unfortunately, this is undocumented
    // This is the object that is passed when listening to an 'flag.action' event
    // Object data has been extracted from inspection, but is unreliable
    type FlagActionEventArgs = {
      actionIdentifier: string;
      flagIdentifier: string;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/history/
    // https://developer.atlassian.com/cloud/confluence/jsapi/history/
    type History = {
      back: () => void;
      forward: () => void;
      go: (delta: number) => void;
      getState: {
        (): string;
        (type: 'hash'|'all'|undefined, callback: (obj: unknown) => void): void;
      };
      pushState: (newState: string, title?: string, url?: string) => void;
      replaceState: (url: string) => void;
      // Unfortunately, this is undocumented
      popState: (handler: (state: HistoryPopState) => void) => void;
    }

    // Unfortunately, this is undocumented
    // This is the object that is passed when listening to AP.history.popState()
    // Object data has been extracted from inspection, but is unreliable
    type HistoryPopState = {
      hash: string;
      href: string;
      key: string;
      newURL: string;
      oldURL?: string
      query: string;
      state: string;
      title: string;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/inline-dialog/
    // https://developer.atlassian.com/cloud/confluence/jsapi/inline-dialog/
    type InlineDialog = {
      hide: () => void;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/navigator/
    // https://developer.atlassian.com/cloud/confluence/jsapi/navigator/
    // Although it is also documented in Jira, AP.Navigator.getLocation() is only available in Confluence
    type Navigator = {
      reload: () => void;
    }

    type NavigatorLocation = {
      target: 'contentview'|'contentedit';
      context: {
        contentId: number,
        contentType: string;
        spaceKey: string;
      };
      href: string;
    }

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
      customData?: Record<string, string>;
      versionOverride?: string;
      embeddedContentRender?: string;
      relativeUrl?: string;
      absoluteUrl?: string;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/page/
    // https://developer.atlassian.com/cloud/confluence/jsapi/page/
    type Page = {
      setTitle: (title: string) => void;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/request/
    // https://developer.atlassian.com/cloud/confluence/jsapi/request/
    type Request = {
      (url: string, options?: RequestOptions): Promise<RequestResponse>;
      (options: RequestOptions): Promise<RequestResponse>;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/request/
    // https://bitbucket.org/atlassian/atlassian-connect-js-extra/src/master/packages/atlassian-connect-js-request/src/plugin/index.js
    type RequestOptions = {
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

    type RequestHeaders = {
      [key: string]: string;
    }

    type RequestResponse = {
      body: string;
      xhr: RequestResponseXHRObject;
    }

    type RequestResponseError = {
      err: Error;
      xhr: RequestResponseXHRObject
    }

    type RequestResponseXHRObject = {
      getAllResponseHeaders: () => string;
      getResponseHeader: (name: string) => string;
      status: number;
      statusText: string;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/scroll-position/
    // https://developer.atlassian.com/cloud/confluence/jsapi/scroll-position/
    type ScrollPosition = {
      getPosition: (callback: (obj: unknown) => void) => void;
      setVerticalPosition: (y: number, callback: (obj: unknown) => void) => void;
    }

    // https://developer.atlassian.com/cloud/jira/platform/connect-theming/
    // https://developer.atlassian.com/cloud/confluence/connect-theming/
    type Theming = {
      initializeTheming: () => void;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/user/
    // https://developer.atlassian.com/cloud/confluence/jsapi/user/
    type User = {
      getCurrentUser: (callback: (user: UserObject) => void) => void;
      getTimeZone: (callback: (timezone: string) => void) => void;
      getLocale: (callback: (locale?: string) => void) => void;
    }

    type UserObject = {
      atlassianAccountId: string;
      accountType: 'atlassian'|'customer';
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/jira/
    type Jira = {
      refreshIssuePage: () => void;
      getWorkflowConfiguration: (callback: (obj: object) => void) => void;
      isDashboardItemEditable: (callback: (isDashboardItemEditable: boolean) => void) => void;
      openCreateIssueDialog: (callback: (issues: Array<OpenCreateIssueDialogResult>) => void, params: OpenCreateIssueDialogParams) => void;
      openIssueDialog: (issueKey: string, callback: (issueKeyOrError: string) => void) => void;
      setDashboardItemTitle: (title: string) => void;
      openDatePicker: (options: DatePickerOptions) => void;
      initJQLEditor: () => void;
      // The documentation incorrectly states that callback is the first argument
      showJQLEditor: (options: JQLEditorOptions, callback: (result?: JQLEditorResult) => void) => void;
      isNativeApp: (callback: (isNativeApp: boolean) => void) => void;
    }

    type OpenCreateIssueDialogParams = {
      pid: number;
      issueType: number;
      fields: Record<string, unknown>;
    }

    // This is an undocumented feature of AP
    // Object data has been extracted from inspection, but is unreliable
    type OpenCreateIssueDialogResult = {
      id: string;
      key: string;
      self: string;
      fields?: Record<string, unknown>;
    }

    // https://developer.atlassian.com/cloud/jira/platform/jsapi/classes/options/
    type DatePickerOptions = {
      element: HTMLElement;
      position: unknown;
      showTime: boolean;
      date: string;
      onSelect: (isoDate: string, date: Date) => void;
    }

    type JQLEditorOptions = {
      jql: string;
      header: string;
      descriptionText: string;
      submitText: string;
      cancelText: string;
    }

    type JQLEditorResult = {
      jql: string;
    }

    // https://developer.atlassian.com/cloud/confluence/jsapi/confluence/
    type Confluence = {
      saveMacro: <T> (macroParameters: T, macroBody?: string) => void;
      closeMacroEditor: () => void;
      getMacroData: <T> (callback: (data: T) => void) => void;
      getMacroBody: (callback: (body: string) => void) => void;
      onMacroPropertyPanelEvent: (eventBindings: { [key: string]: () => void }) => void;
      closeMacroPropertyPanel: () => void;
      getContentProperty: <T> (key: string, callback: (property: T) => void) => void;
      setContentProperty: <T> (contentProperty: ConfluenceContentProperty<T>, callback: (result: { propery: ConfluenceContentProperty<T>, error: Error }) => void) => void;
      syncPropertyFromServer: <T> (key: string, callback: (property: ConfluenceContentProperty<T>) => void) => void;
    }

    type ConfluenceContentProperty<T> = {
      key: string;
      value: string|T;
      version: Record<string, unknown>;
    }

    type ConfluenceContentPropertyResult<T> = {
      propery: AP.ConfluenceContentProperty<T>;
      error: Error;
    }
  }
}