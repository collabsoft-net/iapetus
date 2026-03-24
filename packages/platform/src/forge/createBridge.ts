import { Applications, Modes } from '@collabsoft-net/enums';
import { AbstractRestClientService, BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { createPlaceholder, ForgeRestClient } from '@collabsoft-net/forge';
import { events, router, view, Modal, showFlag } from '@forge/bridge';
import { DocNode } from '@atlaskit/adf-schema';
import { TokenExchangeDTO } from '@collabsoft-net/dto';
import uniqid from 'uniqid';

// We are defining bridge.dialog.open() here because it has a weird overload
// Unfortunately, typescript does not support overload declaration within an object
function open<X> (options: Platform.DialogOptions<Platform.DialogContext, X>): Promise<X|undefined>;
function open<X> (options: Platform.DialogOptions<Platform.DialogContext, X>, callback: Platform.DialogCallback<X>): Promise<X|undefined>;
function open<X, T extends Platform.DialogContext> (options: Platform.DialogOptions<T, X>): Promise<X|undefined>;
function open<X, T extends Platform.DialogContext> (options: Platform.DialogOptions<T, X>, callback: Platform.DialogCallback<X>): Promise<X|undefined>;
function open<X, T extends Platform.DialogContext> (options: Platform.DialogOptions<T, X>, callback?: Platform.DialogCallback<X>): Promise<X|undefined> {
  return new Promise<X|undefined>(resolve => {
    const onClose = (payload?: X) => {
      if (options.onClose) {
        options.onClose(payload);
      }

      if (callback) {
        callback(payload);
      }

      resolve(payload);
    }

    const modal = new Modal({
      resource: options.identifiers.forgeResource,
      onClose,
      size: options.size,
      context: options.context,
      closeOnEscape: options.closeOnEscape,
      closeOnOverlayClick: true
    });

    modal.open();
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
  const options = typeof titleOrOptions !== 'string' ? titleOrOptions : {
    id: uniqid(),
    title,
    type,
    description
  }

  return showFlag(options);
}


export const createBridge: Platform.CreateBridge = async <T extends Applications, X extends AbstractRestClientService> (product: T, service: X) => {

  // What was this person thinking... creating a bridge for Bamboo 🤦🏻
  if (product === Applications.BAMBOO) {
    throw new Error('Atlassian Bamboo is not supported by Atlassian Forge');
  }

  const context = await view.getContext();
  const historyObj = await view.createHistory().catch(() => null);
  let token: TokenExchangeDTO|null = null;

  return {
    
    product,
    platform: Modes.FORGE,
    isCloud: true,
    isLicensed: context.environmentType === 'DEVELOPMENT' || context.license?.active || false,
    service,

    client: (product === 'jira' 
      ? new JiraClientService(new ForgeRestClient(product), Modes.FORGE)
      : product === 'confluence'
        ? new ConfluenceClientService(new ForgeRestClient(product), Modes.FORGE)
        : new BitbucketClientService(new ForgeRestClient(product), Modes.FORGE)
    ) as Platform.ClientService<T>,

    init: {
      createPlaceholder: createPlaceholder
    },

    frame: {
      resize: () => {},
      sizeToParent: () => {}
    },

    events: {
      on: (event: string, callback: <T> (payload: T) => void) => {
        return events.on(event, callback);
      },
      emit: (event: string, payload?: string|number|boolean|Blob|null|Array<string|number|boolean|Blob|null>) => {
        return events.emit(event, payload);
      }
    },

    theming: {
      enable: () => view.theme.enable()
    },

    user: {
      getCurrentUser: async () => context.accountId
    },

    context: {
      getToken: async () => {
        if (!token || token.expires <= new Date().getTime()) {
          token = await service.getToken().catch(() => null);
        }
        return token ? token.token : null; 
      },
      content: async () => {
        if (product === Applications.JIRA) {
          return {
            project: {
              id: context.extension?.project?.id,
              key: context.extension?.project?.key,
              type: context.extension?.project?.type
            },
            issue: {
              id: context.extension?.issue?.id,
              key: context.extension?.issue?.key,
              type: context.extension?.issue?.type,
              typeId: context.extension?.issue?.typeId
            }
          } as Platform.ContentContext<T>;
        } else if (product === Applications.CONFLUENCE) {
          return {
            space: {
              id: context.extension?.space?.id,
              key: context.extension?.space?.key,
            },
            content: {
              id: context.extension?.content?.id,
              type: context.extension?.content?.type,
              subtype: context.extension?.content?.subtype
            },
            macro: {
              outputType: context.extension?.macro?.outputType
            }
          } as Platform.ContentContext<T>;
        } else {
          return {
            workspace: {
              uuid: context.extension?.workspace?.uuid
            },
            repository: {
              uuid: context.extension?.repository?.uuid
            }
          } as Platform.ContentContext<T>;
        }
      },
      location: async () => ({ siteUrl: context.siteUrl })
    },

    dialog: {
      open,
      getProperties: () => context.extension.modal,
      // Forge does not support dialog buttons
      getButton: () => null,
      close: (payload?: unknown) => view.close(payload),
    },

    flag: {
      show
    },

    router: {
      open: router.open,
      navigate: router.navigate,
      reload: router.reload
    },

    history: {
      back: () => {
        if (!historyObj) throw new Error('History API is not available within this module.');
        historyObj.goBack()
      },
      forward: () => {
        if (!historyObj) throw new Error('History API is not available within this module.');
        historyObj.goForward()
      },
      go: (delta: number) => {
        if (!historyObj) throw new Error('History API is not available within this module.');
        historyObj.go(delta)
      },
      getState: (type?: 'hash'|'all'|undefined, callback?: (data: string|Platform.HistoryState) => void) => {
        if (!historyObj) throw new Error('History API is not available within this module.');
        const location = historyObj.location;
        const state: Platform.HistoryState = {
          hash: location.hash,
          href: historyObj.createHref(location),
          key: location.key
        }

        if (type === 'hash') {
          if (callback) {
            callback(state.hash);
          }
          return state.hash;
        } else {
          if (callback) {
            callback(state);
          }
          return state;
        }
      },
      pushState: (newState: string, _?: string, url?: string) => {
        if (!historyObj) throw new Error('History API is not available within this module.');
        url = url || historyObj.createHref(historyObj.location);
        historyObj.push(url, newState);
      },
      replaceState: (url: string) => () => {
        if (!historyObj) throw new Error('History API is not available within this module.');
        historyObj.replace(url)
      },
      popState: (handler: (state: Platform.HistoryPopState) => void) => {
        if (!historyObj) throw new Error('History API is not available within this module.');
        historyObj.listen((location) => {
          handler({
            hash: location.hash,
            href: historyObj.createHref(location),
            key: location.key,
            newURL: historyObj.createHref(location),
            query: location.search,
            state: location.state
          })
        })
      }
    },

    localStorage: {
      get: async (key: string): Promise<string|null> => {
        try {
          return window.localStorage.getItem(key)
        } catch (_ignored) {
          return null;
        }
      },
      set: async (key: string, value: string) => {
        try {
          window.localStorage.setItem(key, value)
        } catch (_ignored) {
          // Do nothing
        }
      }
    },

    macro: {
      disableCloseOnSubmit: () => {},
      getProperties: async () => context.extension.type === 'macro' ? context.extension.config : {},
      setProperties: <T> (data: T, body?: string|DocNode, keepEditing: boolean = false) => view.submit({
        config: data,
        body: typeof body === 'string' ? JSON.parse(body) : body,
        keepEditing
      }),
      close: async <T> (payload?: T) => view.close(payload)
    }
  }

};