
import { Events } from './Events';
import { PlatformInstance } from './Platform'
import { postMessage } from './PostMessage';

/***********************************************************************
 *
 * AP (Confluence)
 * This is the Confluence specific implemenentation of AP
 *
 *********************************************************************** */
export const ConfluenceInstance: AP.ConfluenceInstance = {

  ...PlatformInstance,

  confluence: {
    saveMacro: function <T>(macroParameters: T, macroBody?: string | undefined): void {
      postMessage(Events.AP_CONFLUENCE_SAVEMACRO, { macroParameters, macroBody });
    },
    closeMacroEditor: function (): void {
      postMessage(Events.AP_CONFLUENCE_CLOSEMACROEDITOR);
    },
    getMacroData: function <T>(callback: (data: T) => void): void {
      postMessage(Events.AP_CONFLUENCE_GETMACRODATA, (data?: T) => callback(data || {} as T));
    },
    getMacroBody: function (callback: (body: string) => void): void {
      postMessage(Events.AP_CONFLUENCE_GETMACROBODY, (data?: string) => callback(data || ''));
    },
    onMacroPropertyPanelEvent: function (eventBindings: { [key: string]: () => void; }): void {
      postMessage(Events.AP_CONFLUENCE_ONMACROPROPERTYPANELEVENT, { eventBindings });
    },
    closeMacroPropertyPanel: function (): void {
      postMessage(Events.AP_CONFLUENCE_CLOSEMACROPROPERTYPANEL);
    },
    getContentProperty: function <T>(key: string, callback: (property: T) => void): void {
      postMessage(Events.AP_CONFLUENCE_GETCONTENTPROPERTY, { key }, (data?: T) => callback(data || {} as T));
    },
    setContentProperty: function <T>(contentProperty: AP.ConfluenceContentProperty<T>, callback: (result: AP.ConfluenceContentPropertyResult<T>) => void): void {
      postMessage(Events.AP_CONFLUENCE_SETCONTENTPROPERTY, { contentProperty }, (data?: AP.ConfluenceContentPropertyResult<T>) => callback(data || {} as AP.ConfluenceContentPropertyResult<T>));
    },
    syncPropertyFromServer: function <T>(key: string, callback: (property: AP.ConfluenceContentProperty<T>) => void): void {
      postMessage(Events.AP_CONFLUENCE_SYNCPROPERTYFROMSERVER, { key }, (data?: AP.ConfluenceContentProperty<T>) => callback(data || {} as AP.ConfluenceContentProperty<T>));
    }
  },

  customContent: {
    getEditComponent: function (): AP.CustomContentEditComponent {
      return {
        intercept: function (event: string): void {
          postMessage(Events.AP_CUSTOMCONTENT_INTERCEPT, { event });
        },
        submitCallback: function (value: string | false | AP.CustomContentObject): void {
          postMessage(Events.AP_CUSTOMCONTENT_SUBMITCALLBACK, { value });
        },
        submitSuccessCallback: function (status: boolean, message?: string | undefined): void {
          postMessage(Events.AP_CUSTOMCONTENT_SUBMITSUCCESSCALLBACK, { status, message });
        },
        submitErrorCallback: function (status: boolean, message?: string | undefined): void {
          postMessage(Events.AP_CUSTOMCONTENT_SUBMITERRORCALLBACK, { status, message });
        },
        cancelCallback: function (status: boolean, message?: string | undefined): void {
          postMessage(Events.AP_CUSTOMCONTENT_CANCELCALLBACK, { status, message });
        }
      }
    }
  },

  context: {
    ...PlatformInstance.context,
    getContext: (callback?: (context: AP.ConfluenceContext) => void): Promise<AP.ConfluenceContext> => {
      return new Promise<AP.ConfluenceContext>((resolve, reject) => {
        postMessage(Events.AP_CONTEXT_GETCONTEXT, (data?: AP.ConfluenceContext) => {
          if (data) {
            callback && callback(data);
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
    go: (target: AP.NavigatorTargetConfluence, context: AP.NavigatorContext) => {
      postMessage(Events.AP_NAVIGATOR_GO, { target, context });
    }
  }

}