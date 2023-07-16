import { isOfType } from '@collabsoft-net/helpers';
import { useContext, useEffect, useState } from 'react';

import { JiraClientService } from '../Contexts';
import { useHostContext } from './useHostContext';
import { useJiraUser } from './useJiraUser';

export const useJiraPermissions = (permissions?: Array<Jira.BulkProjectPermissions>, accountId?: string) => {

  const service = useContext(JiraClientService);
  const [ user ] = useJiraUser(accountId);
  const [ context ] = useHostContext();

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();

  useEffect(() => {
    if (context) {
      if (!permissions || !isOfType<AP.JiraContext>(context, 'jira')) {
        setHasPermissions(true);
        setLoading(false);
      } else if (service && user) {
        service.hasPermissions(user.accountId, permissions)
          .then(setHasPermissions)
          .catch(() => setHasPermissions(false))
          .finally(() => setLoading(false))
      }
    }
  }, [ service, user, context ]);

  return [ hasPermissions, isLoading ];
}