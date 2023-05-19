import { useContext, useEffect, useState } from 'react';

import { JiraClientServiceContext } from '../../Contexts/JiraClientServiceContext';

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

export const JiraUserProvider = ({ accountId, requiredPermissions, loadingMessage, cacheDuration, children }: JiraUserProviderProps): JSX.Element => {
  const provider = useContext(JiraClientServiceContext);

  const [ user, setUser ] = useState<Jira.User>();
  const [ permitted, setPermitted ] = useState<boolean>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    provider.then(async instance => {
      if (instance) {
        const jiraClientService = cacheDuration ? instance.cached(cacheDuration) : instance;
        const id = await new Promise<string>(resolve => resolve(accountId));
        const result = await jiraClientService.getUser(id);
        if (requiredPermissions) {
          const hasRequiredPermissions = await jiraClientService.hasPermissions(
            id,
            // If requiredPermissions is not an Array, we are looking for Project Permissions
            !Array.isArray(requiredPermissions) ? [requiredPermissions] : undefined,
            // If requiredPermissions is an Array, we are looking for Global permissions
            Array.isArray(requiredPermissions) ? requiredPermissions : undefined
          ).catch(() => false);
          setPermitted(hasRequiredPermissions);
          setUser(result);
        } else {
          setPermitted(true);
          setUser(result);
        }
      } else {
        setErrors(new Error(`Could not find instance of JiraClientService, please make sure to bind it in your Inversify configuration using "JiraClientService.getIdentifier()"`));
      }
    }).catch(setErrors).finally(() => setLoading(false));
  }, [ provider ]);

  return loading && loadingMessage ? loadingMessage : children({ user, permitted, loading, errors });
}