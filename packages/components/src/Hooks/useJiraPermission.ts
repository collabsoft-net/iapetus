import { isOfType } from '@collabsoft-net/helpers';
import { useContext, useEffect, useState } from 'react';

import { JiraClientService } from '../Contexts';
import { useHostContext } from './useHostContext';
import { useJiraUser } from './useJiraUser';

export const useJiraPermissions = (permissions: Array<Jira.BulkProjectPermissions>, accountId?: string): [ boolean|undefined, boolean, Error|undefined ] => {

  const service = useContext(JiraClientService);
  const [ context, isLoadingContext ] = useHostContext();
  const [ user, isLoadingUser, userError ] = useJiraUser(accountId);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();
  const [ error, setError ] = useState<Error|undefined>();

  useEffect(() => {
    if (!isLoadingContext && !isLoadingUser) {

      if (!context) {
        setHasPermissions(undefined);
        setError(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian host product'));
        setLoading(false);
      } else if (!isOfType<AP.JiraContext>(context, 'jira')) {
        setHasPermissions(undefined);
        setError(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Jira'));
        setLoading(false);
      } else if (!permissions || !Array.isArray(permissions)) {
        setHasPermissions(undefined);
        setError(new Error('Cannot check for permissions, the "permissions" parameter is invalid (Array expected)'));
        setLoading(false);
      } else if (!service) {
        setHasPermissions(undefined);
        setError(new Error('Failed to connect to Atlassian API, JiraClientService is missing'));
        setLoading(false);
      } else if (!user) {
        setHasPermissions(undefined);
        setError(userError);
        setLoading(false);
      } else {
        const accountId = user.accountId || user.key;
        service.hasPermissions(accountId, permissions)
          .then(setHasPermissions)
          .catch((err) => {
            setHasPermissions(undefined);
            setError(err);
          }).finally(() => setLoading(false))
      }
    }
  }, [ isLoadingContext, isLoadingUser ]);

  return [ hasPermissions, isLoading, error ];
}