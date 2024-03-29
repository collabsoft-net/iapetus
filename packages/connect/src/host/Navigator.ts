import { ConnectHelper } from '@collabsoft-net/types';

import { findSource } from './iframe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowWithAJS = window as unknown as Window & { AJS: any };

export const getNavigatorLocation = ({ source, data }: MessageEvent): void => {
  const frame = findSource(source as Window);
  if (frame && frame.contentWindow) {
      const { requestId } = JSON.parse(data);
      if (requestId) {
          const dialogId = frame.getAttribute('data-macroid');
          if (dialogId) {
              const location = {
                  context: {
                      contentId: windowWithAJS.AJS.Meta.get('page-id'),
                      contentType: windowWithAJS.AJS.Meta.get('content-type'),
                      spaceKey: windowWithAJS.AJS.Meta.get('space-key')
                  },
                  target: windowWithAJS.AJS.Meta.get('browse-page-tree-mode') === 'edit' ? 'contentedit' : 'contentview'
              };
              frame.contentWindow.postMessage({ requestId, location }, '*');
          }
      }
  }
};

export const go = ({ data }: MessageEvent, modules: Record<string, string>, { getUrl }: ConnectHelper): void => {
    const { target, context } = JSON.parse(data);
    const ctx: AP.NavigatorContext = context as AP.NavigatorContext;
    switch (target as AP.NavigatorTargetJira|AP.NavigatorTargetConfluence) {
        case 'addonModule':
            window.location.href = getUrl(getLocation(modules[context.moduleKey], context.customData));
            break;
        case 'site':
            if (ctx.absoluteUrl) {
                window.location.href = ctx.absoluteUrl;
            } else if (ctx.relativeUrl) {
                window.location.href = getUrl(ctx.relativeUrl);
            } else {
                console.log('[AC] Received unsupport context for AP.navigator.go() site event', ctx);
            }
            break;
        default:
            console.log('[AC] Received unsupport target or AP.navigator.go() event', target);
    }
};

const getLocation = (url: string, customData: Record<string, string>) => {
    const queryString = new URLSearchParams(customData);
    return url + (url && url.includes('?') ? '&' : '?') + queryString.toString();
}