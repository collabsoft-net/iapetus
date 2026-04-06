import { APRestClient } from '@collabsoft-net/clients';
import { Applications, Modes } from '@collabsoft-net/enums';
import { isOfType, isValidLicense } from '@collabsoft-net/helpers';
import { AbstractRestClientService, BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { waitForAP, createPlaceholder } from '@collabsoft-net/connect';
import { DocNode } from '@atlaskit/adf-schema';
import { Props } from '@collabsoft-net/types';
import uniqid from 'uniqid';

export const createBridge: Platform.CreateBridge = async <T extends Applications, X extends AbstractRestClientService> (product: T, service: X) => {

  const AP = await waitForAP();

  // We are defining bridge.dialog.open() here because it has a weird overload
  // Unfortunately, typescript does not support overload declaration within an object
  function open<X> (options: Platform.DialogOptions<Platform.DialogContext, X>): Promise<X|undefined>;
  function open<X> (options: Platform.DialogOptions<Platform.DialogContext, X>, callback: Platform.DialogCallback<X>): Promise<X|undefined>;
  function open<X, T extends Platform.DialogContext> (options: Platform.DialogOptions<T, X>): Promise<X|undefined>;
  function open<X, T extends Platform.DialogContext> (options: Platform.DialogOptions<T, X>, callback: Platform.DialogCallback<X>): Promise<X|undefined>;
  function open<X, T extends Platform.DialogContext> (options: Platform.DialogOptions<T, X>, callback?: Platform.DialogCallback<X>): Promise<X|undefined> {

    const dialogSize = 
      options.size === 'xlarge'
        ? 'x-large'
        : options.size === 'max'
          ? 'fullscreen'
          : options.size;

    // Atlassian Connect allows users to set default options in the descriptor
    // These default options will be overwritten by the options provided in AP.dialog.create()
    // If for some reason, height, width, size and/or closeOnEscape are 'undefined' in the
    // options parameter, we should not add them to the object to avoid overwriting the defaults
    // with 'undefined' as this will negate the default value provided in the descriptor
    const dialogOptions: AP.DialogOptions<T> = {
      key: options.identifiers.connectKey,
      customData: options.context,
      chrome: false
    };

    if (typeof options.width !== 'undefined') {
      dialogOptions.width = options.width;
    }

    if (typeof options.height !== 'undefined') {
      dialogOptions.height = options.height;
    }

    if (typeof dialogOptions.width === 'undefined' && typeof dialogOptions.height === 'undefined' && typeof dialogSize !== 'undefined') {
      dialogOptions.size = dialogSize;
    }

    if (typeof options.closeOnEscape !== 'undefined') {
      dialogOptions.closeOnEscape = options.closeOnEscape;
    }

    return new Promise<X|undefined>(resolve => {
      AP.dialog.create(dialogOptions).on('close', (data?: X) => {
        if (options.onClose) {
          options.onClose(data);
        };

        if (callback) {
          callback(data);
        }

        resolve(data);
      });
    });
  }

  // We are defining bridge.flag.show() here because it has a weird overload
  // Unfortunately, typescript does not support overload declaration within an object
  function show(title: string): Platform.FlagInstance;
  function show(title: string, type: Platform.FlagType): Platform.FlagInstance;
  function show(title: string, type: Platform.FlagType, description: string): Platform.FlagInstance;
  function show(options: Platform.FlagOptions): Platform.FlagInstance;
  function show(titleOrOptions: string|Platform.FlagOptions, type?: Platform.FlagType, description?: string): Platform.FlagInstance {

    const title = typeof titleOrOptions === 'string' ? titleOrOptions : titleOrOptions.title;
    const options = typeof titleOrOptions !== 'string' ? titleOrOptions : undefined;

    const actions: Record<string, string> = {};
    options?.actions?.forEach(action => {
      const identifier = uniqid();
      actions[identifier] = action.text;

      AP.events.once('flag.action', (payload) => {
        if (payload?.actionIdentifier === identifier) {
          action.onClick();
        }
      });
    });

    const instance = AP.flag.create({
      title,
      body: description || options?.description || '',
      type: type || options?.type || options?.appearance || 'info',
      close: typeof options?.isAutoDismiss === 'boolean' && options?.isAutoDismiss === false ? 'manual' : 'auto',
      actions
    });

    return {
      close: async (): Promise<boolean|void> => {
        return instance.close();
      }
    }
  }

  return {

    product,
    platform: Modes.CONNECT,
    isCloud: true,
    isLicensed: isValidLicense(),
    service,

    client: (product === 'jira'
      ? new JiraClientService(new APRestClient(AP), Modes.CONNECT)
      : product === 'confluence'
        ? new ConfluenceClientService(new APRestClient(AP), Modes.CONNECT)
        : new BitbucketClientService(new APRestClient(AP), Modes.CONNECT)
    ) as Platform.ClientService<T>,
    
    init: {
      createPlaceholder: createPlaceholder
    },

    frame: {
      resize: (width: string, height: string) => AP.resize(width, height),
      sizeToParent: (hideFooter?: boolean) => AP.sizeToParent(hideFooter)
    },

    events: {
      on: async (event: string, callback: <T> (payload?: T) => void) => {
        AP.events.on(event, callback);
        return {
          unsubscribe: () => AP.events.off(event, callback)
        }
      },
      emit: async (event: string, payload?: string|number|boolean|Blob|null|Array<string|number|boolean|Blob|null>) => {
        const data = Array.isArray(payload) ? payload.map(item => String(item)) : [ String(payload) ];
        AP.events.emit(event, data);
      }
    },

    theming: {
      enable: async () => AP.theming.initializeTheming()
    },

    user: {
      getCurrentUser: async () => new Promise<string>((resolve, reject) => isOfType(AP, 'user') 
        ? AP.user.getCurrentUser(({ atlassianAccountId }) => resolve(atlassianAccountId))
        : reject(new Error(`AP.user.getCurrentUser() is not supported in ${product}`)))
    },

    context: {
      getToken: async () => isOfType<AP.PlatformInstance>(AP, 'context') ? AP.context.getToken() : null,
      content: async () => {
        if (isOfType<AP.JiraInstance>(AP, 'jira')) {
          const context = await AP.context.getContext();
          return {
            project: {
              id: context.jira?.project?.id,
              key: context.jira?.project?.key,
            },
            issue: {
              id: context.jira?.issue?.id,
              key: context.jira?.issue?.key,
            }
          } as Platform.ContentContext<T>;
        } else if (isOfType<AP.ConfluenceInstance>(AP, 'confluence')) {
          const context = await AP.context.getContext();
          return {
            space: {
              id: context.confluence?.space?.id,
              key: context.confluence?.space?.key,
            },
            content: {
              id: context.confluence?.content?.id,
              type: context.confluence?.content?.type,
            },
            macro: {
              outputType: context.confluence?.macro?.outputType
            }
          } as Platform.ContentContext<T>;
        } else {
          return {} as Platform.ContentContext<T>;
        }
      },
      location: () => new Promise<Platform.LocationContext>(resolve => AP.getLocation((siteUrl) => resolve({ siteUrl })))
    },

    dialog: {
      open,
      getProperties: () => new Promise<Props|undefined>(resolve => AP.dialog.getCustomData<Props>(resolve)),
      getButton: (name: 'cancel'|'submit'|string) => {
        if (name === 'cancel' || name === 'submit') {
          return AP.dialog.getButton(name)
        } else {
          throw new Error(`InvalidArgumentException: AP.dialog.getButton('${name}') is not supported`);
        }
      },
      close: <T> (payload?: T) => AP.dialog.close(payload),
    },

    flag: {
      show
    },

    router: {
      open: (urlOrLocation: string|Platform.RouterNavigationLocation) => {
        if (isOfType(AP, 'navigator')) {
          if (typeof urlOrLocation === 'string') {
            const anchor = document.createElement('a');
            anchor.href = urlOrLocation;
            anchor.target = '_blank';
            anchor.click();
          } else {
            throw new Error('This method is not supported for in-product navigation');
          }
        }
      },
      navigate: (urlOrLocation: string|Platform.RouterNavigationLocation) => {
        if (isOfType(AP, 'navigator')) {
          if (typeof urlOrLocation === 'string') {
            AP.navigator.go("site", {
              absoluteUrl: urlOrLocation.startsWith('/') ? undefined : urlOrLocation,
              relativeUrl: urlOrLocation.startsWith('/') ? urlOrLocation : undefined
            });
          } else {
            if (urlOrLocation.target === 'module') {
              AP.navigator.go('addonModule', { moduleKey: urlOrLocation.moduleKey, projectId: urlOrLocation.projectKey, spaceKey: urlOrLocation.spaceKey });
            } else if (isOfType(AP, 'jira')) {
              if (urlOrLocation.target === 'issue') {
                AP.navigator.go('issue', { issueKey: urlOrLocation.issueKey });
              } else if (urlOrLocation.target === 'dashboard') {
                AP.navigator.go('dashboard', { dashboardId: urlOrLocation.dashboardId });
              } else if (urlOrLocation.target === 'projectSettingsDetails') {
                AP.navigator.go('projectAdminSummary', { projectKey: urlOrLocation.projectKey });
              } else if (urlOrLocation.target === 'userProfile') {
                AP.navigator.go('userProfile', { userAccountId: urlOrLocation.accountId });
              }
            } else if (isOfType(AP, 'confluence')) {
              if (urlOrLocation.target === 'contentEdit') {
                AP.navigator.go('contentedit', { contentId: urlOrLocation.contentId });
              } else if (urlOrLocation.target === 'contentList') {
                AP.navigator.go('contentlist', { contentType: urlOrLocation.contentType });
              } else if (urlOrLocation.target === 'contentView') {
                AP.navigator.go('contentview', { contentId: urlOrLocation.contentId, versionOverride: urlOrLocation.version });
              } else if (urlOrLocation.target === 'spaceView') {
                AP.navigator.go('spaceview', { spaceKey: urlOrLocation.spaceKey });
              } else if (urlOrLocation.target === 'userProfile') {
                AP.navigator.go('userProfile', { userAccountId: urlOrLocation.accountId });
              }
            }
          }
        }
      },
      reload: () => {
        if (isOfType(AP, 'navigator')) {
          AP.navigator.reload();
        }
      }
    },

    history: {
      back: AP.history.back,
      forward: AP.history.forward,
      go: AP.history.go,
      getState: AP.history.getState,
      pushState: AP.history.pushState,
      replaceState: AP.history.replaceState,
      popState: AP.history.popState
    },

    localStorage: {
      get: async (key: string): Promise<string|null> => {
        if (isOfType(AP, 'cookie')) {
          return new Promise<string|null>(resolve => AP.cookie.read(key, (value) => resolve(value || null)));
        } else {
          try {
            return window.localStorage.getItem(key);
          } catch (_ignored) {
            return null;
          }
        }
      },
      set: async (key: string, value: string) => {
        if (isOfType(AP, 'cookie')) {
          AP.cookie.save(key, value, 365);
        } else {
          try {
            window.localStorage.setItem(key, value);
          } catch (_ignored) {
            // DO NOTHING
          }
        }
      }
    },

    macro: {
      disableCloseOnSubmit() {
        AP.dialog.disableCloseOnSubmit();
      },
      getProperties: <T> () => {
        return new Promise<T>(resolve =>
          isOfType<AP.ConfluenceInstance>(AP, 'confluence')
            ? AP.confluence.getMacroData(resolve)
            : resolve({} as T))
      },
      setProperties: async <T> (data: T, body?: string|DocNode, keepEditing: boolean = false) => {
        if (isOfType<AP.ConfluenceInstance>(AP, 'confluence')) {
          const macroBody = typeof body === 'string' ? body : JSON.stringify(body);
          AP.confluence.saveMacro(data, macroBody);
          if (!keepEditing) {
            AP.confluence.closeMacroEditor();
          }
        }
      },
      close: () => {
        if (isOfType<AP.ConfluenceInstance>(AP, 'confluence')) {
          AP.confluence.closeMacroEditor()
        }
      }
    }

  }
};