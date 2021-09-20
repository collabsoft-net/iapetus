import { ConfluenceHelper, JiraHelper } from '@collabsoft-net/types';
import AJS from 'AJS';
import qs from 'query-string';

import { findSource } from './iframe';

export const getNavigatorLocation = ({ source, data }: MessageEvent): void => {
  const frame = findSource(source as Window);
  if (frame && frame.contentWindow) {
      const { requestId } = JSON.parse(data);
      if (requestId) {
          const dialogId = frame.getAttribute('data-macroid');
          if (dialogId) {
              const location = {
                  context: {
                      contentId: AJS.Meta.get('page-id'),
                      contentType: AJS.Meta.get('content-type'),
                      spaceKey: AJS.Meta.get('space-key')
                  },
                  target: AJS.Meta.get('browse-page-tree-mode') === 'edit' ? 'contentedit' : 'contentview'
              };
              frame.contentWindow.postMessage({ requestId, location }, '*');
          }
      }
  }
};

export const go = ({ data }: MessageEvent, modules: Record<string, string>, { getUrl }: JiraHelper|ConfluenceHelper): void => {
    const { target, context } = JSON.parse(data);
    switch (target as AP.NavigatorTargetJira|AP.NavigatorTargetConfluence) {
        case 'addonModule':
            window.location.href = getUrl(getLocation(modules[context.moduleKey], context.customData));
            break;
        default:
            console.log('[AC] Received unsupport target or AP.navigator.go() event', target);
    }
};

const getLocation = (url: string, customData: Record<string, unknown>) => {
    const queryString = qs.stringify(customData);
    return url + (url && url.includes('?') ? '&' : '?') + queryString;
}