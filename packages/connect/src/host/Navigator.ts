
import { isOfType } from '@collabsoft-net/helpers';

import { Events } from '../client/Events';
import { Message, NavigatorGoRequest } from '../client/Types';
import { BadRequestError, Host, NotImplementedError } from '../Host';
import { getUrl } from './URL';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowWithAJS = window as unknown as Window & { AJS: any };

export const NavigatorLocationEventHandler = (event: MessageEvent, AC: Host): void => {
  const frame = AC.findSource(event);
  if (frame) {
    AC.reply(event, {
      context: {
        contentId: windowWithAJS.AJS.Meta.get('page-id'),
        contentType: windowWithAJS.AJS.Meta.get('content-type'),
        spaceKey: windowWithAJS.AJS.Meta.get('space-key')
      },
      target: windowWithAJS.AJS.Meta.get('browse-page-tree-mode') === 'edit' ? 'contentedit' : 'contentview'
    });
  }
};

export const NavigatorGoEventHandler = (event: MessageEvent<unknown>, AC: Host): void => {
  if (isOfType<Message<NavigatorGoRequest>>(event.data, 'originId')) {
    const { target, context } = event.data.data || {};

    const ctx: AP.NavigatorContext = context as AP.NavigatorContext;
    switch (target as AP.NavigatorTargetJira|AP.NavigatorTargetConfluence) {
      case 'addonModule':
        if (context?.moduleKey) {
          window.location.href = getUrl(getLocation(`/plugins/servlet/atlassian-connect/${AC.options.appKey}/${context.moduleKey}`, context.customData || {}));
        } else {
          throw new BadRequestError();
        }
        break;
      case 'site':
        if (ctx.absoluteUrl) {
          window.location.href = ctx.absoluteUrl;
        } else if (ctx.relativeUrl) {
          window.location.href = getUrl(ctx.relativeUrl);
        } else {
          throw new BadRequestError();
        }
        break;
      default:
        throw new NotImplementedError(Events.AP_NAVIGATOR_GO, event);
    }
  }
};

const getLocation = (url: string, customData: Record<string, string>) => {
  const query = new URLSearchParams(customData);
  const queryString = query.entries.length > 0 ? `${url.includes('?') ? '&' : '?'}${query.toString()}` : '';
  return `${url}${queryString}`;
}