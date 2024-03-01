/* eslint-disable no-case-declarations */

import { isOfType } from '@collabsoft-net/helpers';

import { Events } from './client/Events';
import type { Message } from './client/Types';
import { CookieEraseRequest, CookieReadRequest, CookieSaveRequest, DialogButtonRequest, EventsEmitRequest } from './client/Types';
import { getContext } from './host/Context';
import { CookieEraseEventHandler, CookieReadEventHandler, CookieSaveEventHandler } from './host/Cookie';
import { DialogButtonEventHandler, DialogCloseEventHandler, DialogCreateEventHandler, DialogCustomDataEventHandler } from './host/Dialog';
import { resize, sizeToParent } from './host/iframe';
import { NavigatorGoEventHandler, NavigatorLocationEventHandler } from './host/Navigator';
import { UserCurrentUserEventHandler } from './host/User';

export interface HostOptions {
    verbose?: boolean;
    servletPath: string;
    appKey: string;

    navigator?: {
        go?: {
            addonModule?: Record<string, string>
        }
    },
    dialogs?: Record<string, {
      url: string;
      options: AP.DialogOptions<never>;
    }>
}

export class InvalidMessageError extends Error {}
export class BadRequestError extends Error {}
export class NotImplementedError extends Error {
  constructor(name: string, public event: MessageEvent<unknown>) {
    super(name);
  }
}

export class Host {

  // -------------------------------------------------------------------------- Constructor

  constructor(public options: HostOptions) {
    this.info('[AC] Initializing Atlassian Connect polyfill');
  }

  // -------------------------------------------------------------------------- Public methods

  public async init() {
    window.addEventListener('message', (event: MessageEvent<unknown>) => {

      try {
        const message = this.toMessage(event);
        const name = message.name as Events;
        this.info(`[AC] Received event ${name} (${message.originId})`, event, message);

        switch (name) {
          case Events.HANDSHAKE:
            this.handshakeEventHandler(event);
            break;

          case Events.AP_CONTEXT_GETTOKEN:
          case Events.AP_CONTEXT_GETCONTEXT:
            this.contextEventHandler(name, event);
            break;

          case Events.AP_COOKIE_SAVE:
          case Events.AP_COOKIE_READ:
          case Events.AP_COOKIE_ERASE:
            this.cookieEventHandler(name, event);
            break;

          case Events.AP_CUSTOMCONTENT_INTERCEPT:
          case Events.AP_CUSTOMCONTENT_SUBMITCALLBACK:
          case Events.AP_CUSTOMCONTENT_SUBMITSUCCESSCALLBACK:
          case Events.AP_CUSTOMCONTENT_SUBMITERRORCALLBACK:
          case Events.AP_CUSTOMCONTENT_CANCELCALLBACK:
            this.customContentEventHandler(name, event);
            break;

          case Events.AP_DIALOG_CREATE:
          case Events.AP_DIALOG_CLOSE:
          case Events.AP_DIALOG_GETCUSTOMDATA:
          case Events.AP_DIALOG_GETBUTTON:
          case Events.AP_DIALOG_DISABLECLOSEONSUBMIT:
          case Events.AP_DIALOG_CREATEBUTTON:
          case Events.AP_DIALOG_ISCLOSEONESCAPE:
          case Events.AP_DIALOG_ON:
            this.dialogEventHandler(name, event);
            break;

          case Events.AP_EVENTS_ON:
          case Events.AP_EVENTS_ONPUBLIC:
          case Events.AP_EVENTS_ONCE:
          case Events.AP_EVENTS_ONCEPUBLIC:
          case Events.AP_EVENTS_ONANY:
          case Events.AP_EVENTS_ONANYPUBLIC:
          case Events.AP_EVENTS_OFF:
          case Events.AP_EVENTS_OFFPUBLIC:
          case Events.AP_EVENTS_OFFALL:
          case Events.AP_EVENTS_OFFALLPUBLIC:
          case Events.AP_EVENTS_OFFANY:
          case Events.AP_EVENTS_OFFANYPUBLIC:
          case Events.AP_EVENTS_EMIT:
          case Events.AP_EVENTS_EMITPUBLIC:
            this.eventsEventHandler(name, event);
            break;

          case Events.AP_FLAG_CREATE:
          case Events.AP_FLAG_CLOSE:
            this.dialogEventHandler(name, event);
            break;

          case Events.AP_HISTORY_BACK:
          case Events.AP_HISTORY_FORWARD:
          case Events.AP_HISTORY_GO:
          case Events.AP_HISTORY_GETSTATE:
          case Events.AP_HISTORY_PUSHSTATE:
          case Events.AP_HISTORY_REPLACESTATE:
          case Events.AP_HISTORY_POPSTATE:
            this.historyEventHandler(name, event);
            break;

          case Events.AP_IFRAME_GETLOCATION:
          case Events.AP_IFRAME_RESIZE:
          case Events.AP_IFRAME_SIZETOPARENT:
            this.iframeEventHandler(name, event);
            break;

          case Events.AP_REQUEST:
            this.requestEventHandler(name, event);
            break;

          case Events.AP_INLINEDIALOG_HIDE:
            this.inlineDialogEventHandler(name, event);
            break;

          case Events.AP_NAVIGATOR_RELOAD:
          case Events.AP_NAVIGATOR_GETLOCATION:
          case Events.AP_NAVIGATOR_GO:
            this.navigatorEventHandler(name, event);
            break;

          case Events.AP_PAGE_SETTITLE:
            this.pageEventHandler(name, event);
            break;

          case Events.AP_SCROLLPOSITION_GETPOSITION:
          case Events.AP_SCROLLPOSITION_SETVERTICALPOSITION:
            this.scrollPositionEventHandler(name, event);
            break;

          case Events.AP_THEMING_INITIALIZETHEMING:
            this.themingEventHandler(name, event);
            break;

          case Events.AP_USER_GETCURRENTUSER:
          case Events.AP_USER_GETTIMEZONE:
          case Events.AP_USER_GETLOCALE:
            this.userEventHandler(name, event);
            break;

          case Events.AP_JIRA_REFRESHISSUEPAGE:
          case Events.AP_JIRA_GETWORKFLOWCONFIGURATION:
          case Events.AP_JIRA_ISDASHBOARDITEMEDITABLE:
          case Events.AP_JIRA_OPENCREATEISSUEDIALOG:
          case Events.AP_JIRA_OPENISSUEDIALOG:
          case Events.AP_JIRA_SETDASHBOARDITEMTITLE:
          case Events.AP_JIRA_OPENDATEPICKER:
          case Events.AP_JIRA_INITJQLEDITOR:
          case Events.AP_JIRA_SHOWJQLEDITOR:
          case Events.AP_JIRA_ISNATIVEAPP:
            this.jiraEventHandler(name, event);
            break;

          case Events.AP_CONFLUENCE_SAVEMACRO:
          case Events.AP_CONFLUENCE_CLOSEMACROEDITOR:
          case Events.AP_CONFLUENCE_GETMACRODATA:
          case Events.AP_CONFLUENCE_GETMACROBODY:
          case Events.AP_CONFLUENCE_ONMACROPROPERTYPANELEVENT:
          case Events.AP_CONFLUENCE_CLOSEMACROPROPERTYPANEL:
          case Events.AP_CONFLUENCE_GETCONTENTPROPERTY:
          case Events.AP_CONFLUENCE_SETCONTENTPROPERTY:
          case Events.AP_CONFLUENCE_SYNCPROPERTYFROMSERVER:
            this.confluenceEventHandler(name, event);
            break;
        }
      } catch (err) {
        if (err instanceof InvalidMessageError) {
          // Ignore this message.
          // We only process 'message' events that are explicitly designed for Atlassian Connect polyfill
        } else if (err instanceof BadRequestError) {
          this.badRequest(event);
        } else if (err instanceof NotImplementedError) {
          this.unsupportedEvent(err.message as Events);
        } else {
          this.error(err, event);
        }
      }
    });
  }

  public emit(originId: string, name: string): void;
  public emit<T>(originId: string, name: string, data: T): void;
  public emit<T>(originId: string, name: string, data?: T) {
    const frames = this.getFrames(this.options.appKey);
    frames.forEach(frame => {
      const addonKey = frame.getAttribute('data-ap-appkey');
      const key = frame.getAttribute('data-ap-key');

      frame.contentWindow?.postMessage({
        name: name as Events,
        originId,
        addonKey,
        key,
        data
      }, '*')
    });
  }

  public emitPublic<T>(originId: string, name: string, data?: T) {
    const frames = this.getFrames();
    frames.forEach(frame => {
      const addonKey = frame.getAttribute('data-ap-appkey');
      const key = frame.getAttribute('data-ap-key');

      frame.contentWindow?.postMessage({
        name: name as Events,
        originId,
        addonKey,
        key,
        data
      }, '*')
    });
  }

  public reply(event: MessageEvent<unknown>): void;
  public reply<T>(event: MessageEvent<unknown>, message: T): void;
  public reply<T>(event: MessageEvent<unknown>, message?: T): void {
    const data = this.toMessage(event);

    const frame = this.findSource(event);
    if (frame && frame.contentWindow) {
      const { name, originId } = data;
      const addonKey = frame.getAttribute('data-ap-appkey');
      const key = frame.getAttribute('data-ap-key');

      const payload: Message<T> = {
        name,
        originId,
        addonKey,
        key,
        data: message
      };

      frame.contentWindow.postMessage(payload, '*');
    }
  }

  public findSource(targetId: string): HTMLIFrameElement|undefined;
  public findSource<T>(event: MessageEvent<T>): HTMLIFrameElement|undefined;
  public findSource<T>(eventOrTargetId: MessageEvent<T>|string): HTMLIFrameElement|undefined {
    // Parse the arguments
    const event = isOfType<MessageEvent>(eventOrTargetId, 'source') ? eventOrTargetId : null;
    const targetId = typeof eventOrTargetId === 'string'
      ? eventOrTargetId
      : event && isOfType<Message<never>>(event.data, 'originId')
        ? event.data.originId
        : null;

    // See if we can find the frame based on the origin ID
    if (targetId) {
      const frame = document.querySelector<HTMLIFrameElement>(`IFRAME[data-ap-origin='${targetId}']`);
      if (frame) return frame;
    }

    // If we can't find the frame, and we don't have an event, abort
    if (!event || !event.source) return undefined;

    // Get all iframes on the page
    const frames = this.getFrames();

    // Retrieve the iframe based on the event source
    const { source } = event;
    return frames.find(element => {
      const { contentWindow } = element as HTMLIFrameElement;
      return (contentWindow === source || contentWindow === (source as Window).parent);
    });
  }

  // -------------------------------------------------------------------------- Private methods

  private handshakeEventHandler(event: MessageEvent<unknown>) {
    const frame = this.findSource(event);
    const { originId, data: options } = this.toMessage<AP.FrameOptions>(event)

    if (frame) {

      // Only set the origin attribute if it does not exist
      if (!frame.hasAttribute('data-ap-origin')) {
        frame.setAttribute('data-ap-origin', originId);
      }

      this.reply(event);

      if (options?.resize) {
        const parent = frame.parentElement;
        if (frame && parent) {
          this.info('[AC] Enabling automatic resize of iframe');
          new ResizeObserver(() => {
            this.info('[AC] Resizing iframe to parent')

            const computedStyle = getComputedStyle(parent);
            const innerHeight = parent.clientHeight - (parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom));
            const differenceInHeight = innerHeight - frame.clientHeight;

            if (differenceInHeight > 10) {
              frame.setAttribute('height', `${innerHeight}px`);
            }
            if (frame.clientWidth !== parent.clientWidth) {
              frame.setAttribute('width', `${parent.clientWidth}px`);
            }
          }).observe(parent, { box: 'border-box' });
        }
      }

      if (options?.sizeToParent) {
        this.info('[AC] Resizing iframe to parent container');
        sizeToParent(event, this);
      }

      if (options?.base) {
        this.error(new Error('frame option "base" is currently not implemented'), event);
      }

      if (options?.margin) {
        this.error(new Error('frame option "margin" is currently not implemented'), event);
      }

    } else {
      this.badRequest(event);
    }
  }

  private contextEventHandler(name: Events, event: MessageEvent<unknown>) {
    switch (name) {
      case Events.AP_CONTEXT_GETCONTEXT:
        const context = getContext();
        this.reply(event, context);
        break;
      case Events.AP_CONTEXT_GETTOKEN:
        this.unsupportedEvent(name);
    }
  }

  private cookieEventHandler(name: Events, event: MessageEvent<unknown>) {
    switch (name) {
      case Events.AP_COOKIE_SAVE:
        CookieSaveEventHandler(this.toMessage<CookieSaveRequest>(event));
        break;
      case Events.AP_COOKIE_READ:
        const response = CookieReadEventHandler(this.toMessage<CookieReadRequest>(event));
        this.reply(event, response);
        break;
      case Events.AP_COOKIE_ERASE:
        CookieEraseEventHandler(this.toMessage<CookieEraseRequest>(event));
        break;
    }
  }

  private customContentEventHandler(name: Events, event: MessageEvent<unknown>) {
    throw new NotImplementedError(name, event);
  }

  private dialogEventHandler(name: Events, event: MessageEvent<unknown>) {
    switch (name) {
      case Events.AP_DIALOG_CREATE:
        DialogCreateEventHandler(this.toMessage<AP.DialogOptions<never>>(event), this);
        break;
      case Events.AP_DIALOG_CLOSE:
        DialogCloseEventHandler(event, this);
        break;
      case Events.AP_DIALOG_GETCUSTOMDATA:
        DialogCustomDataEventHandler(event, this);
        break;

      case Events.AP_DIALOG_GETBUTTON:
        DialogButtonEventHandler(event as MessageEvent<Message<DialogButtonRequest>>, this);
        break;

      case Events.AP_DIALOG_DISABLECLOSEONSUBMIT:
      case Events.AP_DIALOG_CREATEBUTTON:
      case Events.AP_DIALOG_ISCLOSEONESCAPE:
      case Events.AP_DIALOG_ON:
        this.unsupportedEvent(name);
        break;
    }
  }

  private eventsEventHandler(name: Events, event: MessageEvent<unknown>) {
    const { originId, data } = this.toMessage<EventsEmitRequest>(event);
    if (!data) throw new BadRequestError();

    switch (name) {
      case Events.AP_EVENTS_EMIT:
        this.emit(originId, data.name, data.args);
        break;
      case Events.AP_EVENTS_EMITPUBLIC:
        this.emitPublic(originId, data.name, data.args);
        break;
      default:
        throw new NotImplementedError(name, event);
    }
  }

  private historyEventHandler(name: Events, event: MessageEvent<unknown>) {
    throw new NotImplementedError(name, event);
  }

  private iframeEventHandler(name: Events, event: MessageEvent<unknown>) {
    switch (name) {
      case Events.AP_IFRAME_RESIZE:
        resize(event, this);
        break;

      case Events.AP_IFRAME_GETLOCATION:
        const location = window.location.href;
        this.reply(event, location);
        break;

      case Events.AP_IFRAME_SIZETOPARENT:
        sizeToParent(event, this);
        break;

    }
  }

  private requestEventHandler(name: Events, event: MessageEvent<unknown>) {
    throw new NotImplementedError(name, event);
  }

  private inlineDialogEventHandler(name: Events, event: MessageEvent<unknown>) {
    throw new NotImplementedError(name, event);
  }

  private navigatorEventHandler(name: Events, event: MessageEvent<unknown>) {
    switch (name) {
      case Events.AP_NAVIGATOR_GETLOCATION:
        NavigatorLocationEventHandler(event, this);
        break
      case Events.AP_NAVIGATOR_GO:
        NavigatorGoEventHandler(event, this);
        break;
      case Events.AP_NAVIGATOR_RELOAD:
        window.location.reload();
        break;
    }
  }

  private pageEventHandler(name: Events, event: MessageEvent<unknown>) {
    throw new NotImplementedError(name, event);
  }

  private scrollPositionEventHandler(name: Events, event: MessageEvent<unknown>) {
    throw new NotImplementedError(name, event);
  }

  private themingEventHandler(name: Events, event: MessageEvent<unknown>) {
    throw new NotImplementedError(name, event);
  }

  private userEventHandler(name: Events, event: MessageEvent<unknown>) {
    switch (name) {
      case Events.AP_USER_GETCURRENTUSER:
        UserCurrentUserEventHandler(event, this);
        break;

    }
  }

  private jiraEventHandler(name: Events, event: MessageEvent<unknown>) {
    throw new NotImplementedError(name, event);
  }

  private confluenceEventHandler(name: Events, event: MessageEvent<unknown>) {
    throw new NotImplementedError(name, event);
  }

  private unsupportedEvent(name: Events) {
    console.warn(`[AC] Received unsupported event ${name}, no response was sent to client`);
  }

  private badRequest(event: MessageEvent<unknown>) {
    try {
      const message = this.toMessage(event);
      const name = message.name as Events;
      console.warn(`[AC] Received incorrect payload for event ${name}, no response was sent to client`);
    } catch (err) {
      this.error(err, event);
    }
  }

  private error(err: unknown, event?: MessageEvent<unknown>) {
    console.error(`[AC] An unknown error occurred while processing event`, err, event);
  }

  private info(message: string, ...args: Array<unknown>) {
    if (this.options.verbose) {
      console.log(message, ...args);
    }
  }

  private toMessage<T>(event: MessageEvent<unknown>) {
    const { data } = event;
    if (!isOfType<Message<T>>(data, 'originId')) {
      throw new InvalidMessageError('Event data is not an Atlassian Connect polyfill message');
    }
    return data;
  }

  private getFrames(appKey?: string): Array<HTMLIFrameElement> {
    const selector = appKey ? `IFRAME[data-ap-appkey='${appKey}']` : 'IFRAME[data-ap-appkey]';
    const frames: NodeListOf<HTMLIFrameElement> = document.querySelectorAll(selector);
    return Array.from(frames);
  }

}