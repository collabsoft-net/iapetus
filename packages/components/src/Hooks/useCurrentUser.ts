import { useContext, useEffect, useState } from 'react';

import { AP as APContext } from '../Contexts';
import { useHostService } from './useHostService';

export const useCurrentUser = (accountId?: string|PromiseLike<string>): [ Jira.User|Confluence.User|null, boolean, Error|undefined ] => {

  const AP = useContext(APContext);
  const service = useHostService();

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ user, setUser ] = useState<Jira.User|Confluence.User|null>(null);
  const [ error, setError ] = useState<Error>();

  useEffect(() => {
    if (!AP) {
      setUser(null);
      setError(new Error('Cannot retrieve User, hook is executed outside of context of Atlassian host product'));
      setLoading(false);
    } else {
      if (!service) {
        setUser(null);
        setError(new Error('Failed to connect to Atlassian API, either JiraClientService or ConfluenceClientService is missing'));
        setLoading(false);
      } else {
        new Promise<string>(resolve => accountId ? resolve(accountId) : AP.user.getCurrentUser(({ atlassianAccountId }) => resolve(atlassianAccountId)))
          .then(id => {
            if (!id) {
              return Promise.reject(new Error('Could not retrieve Atlassian user, account ID was not found'));
            } else {
              return service.getUser(id).then(setUser)
            }
          })
          .catch((err) => {
            setUser(null);
            setError(err);
            setLoading(false);
          }).finally(() => setLoading(false));
      }
    }
  }, []);

  return [ user, isLoading, error ];
}