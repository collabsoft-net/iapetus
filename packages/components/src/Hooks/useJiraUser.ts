import { isOfType } from '@collabsoft-net/helpers';
import { useContext, useEffect, useState } from 'react';

import { AP as APContext , JiraClientService } from '../Contexts';

export const useJiraUser = (accountId?: string|PromiseLike<string>): [ Jira.User|null, boolean ] => {

  const AP = useContext(APContext);
  const service = useContext(JiraClientService);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ user, setUser ] = useState<Jira.User|null>(null);

  useEffect(() => {
    if (AP && service) {
      if (isOfType(AP, 'jira')) {
        new Promise<string>(resolve => accountId
          ? resolve(accountId)
          : AP.user.getCurrentUser(({ atlassianAccountId }) => resolve(atlassianAccountId))
        ).then(id => service.getUser(id)).then(setUser).finally(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    }
  }, [ service ]);

  return [ user, isLoading ];
}