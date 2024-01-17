import { useContext, useEffect, useState } from 'react';

import { JiraClientService } from '../../Contexts/JiraClientService';
import { useJiraUser } from '../../Hooks';

interface JiraUserProviderProps {
  accountId: string|PromiseLike<string>;
  requiredPermissions?: Jira.BulkProjectPermissions|Array<string>;
  loadingMessage?: JSX.Element;
  cacheDuration?: number;
  children: (args: {
    user?: Jira.User|null;
    permitted?: boolean;
    errors?: Error;
    loading: boolean;
  }) => JSX.Element;
}

export const JiraUserProvider = ({ accountId, requiredPermissions, loadingMessage, cacheDuration, children }: JiraUserProviderProps): JSX.Element => {

  const jiraClientService = useContext(JiraClientService);
  const [ user ] = useJiraUser(accountId);

  const [ permitted, setPermitted ] = useState<boolean>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    if (!jiraClientService) {
      setErrors(new Error(`Failed to retrieve instance of JiraClientService, please make sure the JiraClientService context is inititalized`));
      setLoading(false);
    } else if (user && requiredPermissions) {
      const service = cacheDuration ? jiraClientService.cached(cacheDuration) : jiraClientService;
      const accountId = user.accountId || user.key;
      service.hasPermissions(
        accountId,
        // If requiredPermissions is not an Array, we are looking for Project Permissions
        !Array.isArray(requiredPermissions) ? [requiredPermissions] : undefined,
        // If requiredPermissions is an Array, we are looking for Global permissions
        Array.isArray(requiredPermissions) ? requiredPermissions : undefined
      ).then(setPermitted).catch(() => setPermitted(false)).finally(() => setLoading(false));
    } else if (user && !requiredPermissions) {
      setLoading(false);
    }
  }, [ jiraClientService, user ]);

  return loading && loadingMessage ? loadingMessage : children({ user, permitted, loading, errors });
}