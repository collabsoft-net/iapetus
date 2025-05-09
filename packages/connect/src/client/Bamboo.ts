
import { Events } from './Events';
import { PlatformInstance } from './Platform'
import { postMessage } from './PostMessage';

/***********************************************************************
 *
 * AP (Bamboo)
 * This is the Bamboo specific implemenentation of AP
 * Unfortunately, no documentation exist because there is no cloud version of Bamboo
 * However, to be able to re-use the same code between Atlassian products
 * this emulates Atlassian Connect behaviour for Bamboo as if there was a Cloud version
 *
 *********************************************************************** */
export const BambooInstance: AP.BambooInstance = {

  ...PlatformInstance,

  bamboo: {
    name: 'bamboo'
  },

  context: {
    ...PlatformInstance.context,
    getContext: (callback?: (context: AP.BambooContext) => void): Promise<AP.BambooContext> => {
      return new Promise<AP.BambooContext>((resolve, reject) => {
        postMessage(Events.AP_CONTEXT_GETCONTEXT, (data?: AP.BambooContext) => {
          if (data) {
            if (callback) {
              callback(data);
            }
            resolve(data);
          } else {
            reject()
          }
        });
      })
    }
  },

  navigator: {
    ...PlatformInstance.navigator,
    getLocation: (callback: (location: AP.NavigatorLocation) => void) => {
      postMessage(Events.AP_NAVIGATOR_GETLOCATION, callback);
    },
    go: (target: AP.NavigatorTargetBamboo, context: AP.NavigatorContext) => {
      postMessage(Events.AP_NAVIGATOR_GO, { target, context });
    }
  }

}