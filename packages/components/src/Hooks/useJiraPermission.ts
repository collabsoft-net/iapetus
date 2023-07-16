import { useContext, useEffect, useState } from 'react';

import { JiraClientService } from '../Contexts';
import { useJiraUser } from './useJiraUser';

export const useJiraPermissions = (permissions?: Array<Jira.BulkProjectPermissions>, accountId?: string) => {

  const service = useContext(JiraClientService);
  const [ user ] = useJiraUser(accountId);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();

  useEffect(() => {
    if (!permissions) {
      setHasPermissions(true);
      setLoading(false);
    } else if (service && user) {
      service.hasPermissions(user.accountId, permissions)
        .then(setHasPermissions)
        .catch(() => false)
        .finally(() => setLoading(false))
    }
  }, [ service, user ]);

  return [ hasPermissions, isLoading ];
}