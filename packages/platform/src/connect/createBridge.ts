import { APRestClient } from '@collabsoft-net/clients';
import { Applications, Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { waitForAP, createPlaceholder, getDialogProps } from '@collabsoft-net/connect';
import { DocNode } from '@atlaskit/adf-schema';
import { Props } from '@collabsoft-net/types';

export const createBridge: Platform.CreateBridge = async <T extends Applications> (product: T) => {

  const AP = await waitForAP();

  return {

    product,
    platform: Modes.CONNECT,

    init: {
      createPlaceholder: createPlaceholder
    },

    events: {
      on: async (event: string, callback: (payload?: unknown) => Promise<unknown>) => {
        AP.events.on(event, callback);
        return {
          unsubscribe: () => AP.events.off(event, callback)
        }
      },
      emit: async (event: string, payload: unknown) => {
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
      }
    },

    dialog: {
      open: async <T, X> (options: Platform.DialogOptions<T, X>) => {
        const dialogSize = 
          options.size === 'xlarge'
            ? 'x-large'
            : options.size === 'max'
              ? 'fullscreen'
              : options.size;

        AP.dialog.create({
          key: options.key,
          size: options.height || options.width ? undefined : dialogSize,
          height: options.height,
          width: options.width,
          customData: options.context,
          closeOnEscape: options.closeOnEscape,
          chrome: false
        }).on('close', (data?: X) => {
          if (options.onClose) {
            options.onClose(data);
          };
        });
      },
      getProperties: getDialogProps,
      getButton: (name: 'cancel'|'submit'|string) => {
        if (name === 'cancel' || name === 'submit') {
          return AP.dialog.getButton(name)
        } else {
          throw new Error(`InvalidArgumentException: AP.dialog.getButton('${name}') is not supported`);
        }
      },
      close: (payload?: unknown) => AP.dialog.close(payload),
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

    macro: {
      disableCloseOnSubmit() {
        AP.dialog.disableCloseOnSubmit();
      },
      getProperties: () => {
        return new Promise<Props|undefined>(resolve =>
          isOfType<AP.ConfluenceInstance>(AP, 'confluence')
            ? AP.confluence.getMacroData(resolve)
            : resolve({}))
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
          AP.confluence.closeMacroEditor();
        }
      }
    },

    client: (product === 'jira'
      ? new JiraClientService(new APRestClient(AP), Modes.CONNECT)
      : product === 'confluence'
        ? new ConfluenceClientService(new APRestClient(AP), Modes.FORGE)
        : new BitbucketClientService(new APRestClient(AP), Modes.FORGE)
    ) as Platform.ClientService<T>

  }
};