import { useContext, useEffect, useState } from 'react';

import { AP as APContext , ConfluenceClientService, JiraClientService } from '../Contexts';

export const useCurrentUser = (accountId?: string|PromiseLike<string>): [ Jira.User|Confluence.User|null, boolean ] => {

  const AP = useContext(APContext);
  const jiraService = useContext(JiraClientService);
  const confluenceService = useContext(ConfluenceClientService);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ user, setUser ] = useState<Jira.User|Confluence.User|null>(null);

  useEffect(() => {
    if (AP) {
      new Promise<string>(resolve => accountId
        ? resolve(accountId)
        : AP.user.getCurrentUser(({ atlassianAccountId }) => resolve(atlassianAccountId))
      ).then(id => {
        const service = jiraService || confluenceService;
        return service ? service.getUser(id).then(setUser).catch(() => setUser(null)) : Promise.resolve();
      }).finally(() => setLoading(false));
    }
  }, [ AP, jiraService, confluenceService ]);

  return [ user, isLoading ];
}