import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import { JiraClientService } from '@collabsoft-net/services';
import { useEffect, useState } from 'react';

interface JiraUserProviderProps {
  accountId: string|PromiseLike<string>;
  requiredPermissions?: Jira.BulkProjectPermissions|Array<string>;
  loadingMessage?: JSX.Element;
  cacheDuration?: number;
  children: (args: {
    user?: Jira.User;
    permitted?: boolean;
    errors?: Error;
    loading: boolean;
  }) => JSX.Element;
}

let service: JiraClientService;
let AP: AP.Instance;

kernel.onReady(() => {
  if (kernel.isBound(JiraClientService.getIdentifier())) {
    service = kernel.get<JiraClientService>(JiraClientService.getIdentifier());
  } else {
    throw new Error(`Could not find instance of JiraClientService, please make sure to bind it in your Inversify configuration using "JiraClientService.getIdentifier()"`);
  }

  if (kernel.isBound(ServiceIdentifier.AP)) {
    AP = kernel.get<AP.Instance>(ServiceIdentifier.AP);
  } else {
    throw new Error(`Could not find instance of AP, please make sure to bind it in your Inversify configuration using "ServiceIdentifier.AP"`);
  }
});

export const JiraUserProvider = ({ accountId, requiredPermissions, loadingMessage, cacheDuration, children }: JiraUserProviderProps): JSX.Element => {
  const [ user, setUser ] = useState<Jira.User>();
  const [ permitted, setPermitted ] = useState<boolean>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    if (AP && service) {
      const jiraClientService = cacheDuration ? service.cached(cacheDuration) : service;
      new Promise<string>(resolve => resolve(accountId)).then(id =>
        jiraClientService.getUser(id).then(async (result) => {
          if (requiredPermissions) {
            const hasRequiredPermissions = await jiraClientService.hasPermissions(
              id,
              // If requiredPermissions is not an Array, we are looking for Project Permissions
              !Array.isArray(requiredPermissions) ? [ requiredPermissions ] : undefined,
              // If requiredPermissions is an Array, we are looking for Global permissions
              Array.isArray(requiredPermissions) ? requiredPermissions : undefined
            ).catch(() => false)
            setPermitted(hasRequiredPermissions);
            setUser(result);
          } else {
            setPermitted(true);
            setUser(result);
          }
        })
      ).catch(setErrors).finally(() => setLoading(false));
    }
  }, [ AP, service ]);

  return loading && loadingMessage ? loadingMessage : children({ user, permitted, loading, errors });
}