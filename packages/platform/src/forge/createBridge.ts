import { Applications, Modes } from '@collabsoft-net/enums';
import { BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { createPlaceholder, ForgeRestClient, getMacroDataProps } from '@collabsoft-net/forge';
import { router, view } from '@forge/bridge';
import { DocNode } from '@atlaskit/adf-schema';

export const createBridge: Platform.CreateBridge = async <T extends Applications> (product: T) => {

  const context = await view.getContext();
  const historyObj = await view.createHistory().catch(() => null);

  return {
    
    product,
    platform: Modes.FORGE,

    init: {
      createPlaceholder: createPlaceholder
    },

    theming: {
      enable: () => view.theme.enable()
    },

    user: {
      getCurrentUser: async () => context.accountId
    },

    context: {
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
      }
    },

    dialog: {
      close: (payload?: unknown) => view.close(payload),
    },

    router: {
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

    macro: {
      getProperties: getMacroDataProps,
      setProperties: <T> (data: T, body?: string|DocNode, keepEditing: boolean = false) => view.submit({
        config: data,
        body: typeof body === 'string' ? JSON.parse(body) : body,
        keepEditing
      }),
      close: async () => {
        const config = context.extension?.config || {};
        const body = context.extension?.macro?.body;
        return view.submit({
          config, 
          body, 
          keepEditing: false
        });
      }
    },

    client: (product === 'jira' 
      ? new JiraClientService(new ForgeRestClient(product), Modes.FORGE)
      : product === 'confluence'
        ? new ConfluenceClientService(new ForgeRestClient(product), Modes.FORGE)
        : new BitbucketClientService(new ForgeRestClient(product), Modes.FORGE)
    ) as Platform.ClientService<T>
  }

};