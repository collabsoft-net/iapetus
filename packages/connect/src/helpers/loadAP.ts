
import { isOfType } from '@collabsoft-net/helpers';

import { WindowWithAP } from '../AP';
import { Handshake } from '../client/Handshake';
import { waitForAP } from './waitForAP';

const windowWithAP = window as unknown as WindowWithAP;

export const loadAP = async (options: {
  url?: string;
  resize: boolean;
  sizeToParent: boolean;
  margin: boolean;
  base: boolean;
} = {
  url: 'https://connect-cdn.atl-paas.net/all.js',
  resize: true,
  sizeToParent: false,
  margin: true,
  base: false
}): Promise<AP.JiraInstance|AP.ConfluenceInstance> => {
  const resize = new Boolean(options.resize).toString();
  const sizeToParent = new Boolean(options.sizeToParent).toString();
  const margin = new Boolean(options.margin).toString();
  const base = new Boolean(options.base).toString();
  const iframeOptions = `resize:${resize};sizeToParent:${sizeToParent};margin:${margin};base:${base}`;

  // We will not only place the options on the script tag, also add it as a div
  window.onload = () => {
    const frameOptionsDiv = document.createElement('div');
    frameOptionsDiv.setAttribute('id', 'ac-iframe-options');
    frameOptionsDiv.setAttribute('data-options', iframeOptions);
    document.body.append(frameOptionsDiv);
  }

  try {
    const AP = await (windowWithAP.AP
      ? new Promise<AP.JiraInstance|AP.ConfluenceInstance>(resolve => resolve(windowWithAP.AP))
      : new Promise<AP.JiraInstance|AP.ConfluenceInstance>((resolve, reject) => {
        const script = document.createElement('script');
        script.onload = async function() {
          try {
            const result = await waitForAP();
            resolve(result);
          } catch (err) {
            reject();
          }
        };
        script.onerror = reject;
        script.setAttribute('data-options', iframeOptions);
        script.setAttribute('type', 'application/javascript');
        script.src = options.url || 'https://connect-cdn.atl-paas.net/all.js';
        document.head.appendChild(script);
      })
    );

    // Double check to make sure we actually have an AP object
    if (!AP) {
      throw new Error('Atlassian Javascript API (AP) is not available');
    }

    // If this is a polyfill, initialise the handshake
    if (isOfType<AP.PlatformInstance>(AP, 'isPolyfill')) {
      await Handshake(options);
    }

    if (isOfType<AP.JiraInstance>(AP, 'jira')) {
      return { ...windowWithAP.AP } as AP.JiraInstance;
    } else if (isOfType<AP.ConfluenceInstance>(AP, 'confluence')) {
      return { ...windowWithAP.AP } as AP.ConfluenceInstance;
    } else {
      throw new Error();
    }
  } catch (err) {
    throw new Error('Atlassian Javascript API (AP) is not available');
  }
};
