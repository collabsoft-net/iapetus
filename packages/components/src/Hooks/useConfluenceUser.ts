import { isOfType } from '@collabsoft-net/helpers';
import { useContext, useEffect, useState } from 'react';

import { AP as APContext , ConfluenceClientService } from '../Contexts';

export const useConfluenceUser = (accountId?: string): [ Confluence.User|null, boolean, Error|undefined ] => {

  const AP = useContext(APContext);
  const service = useContext(ConfluenceClientService);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ user, setUser ] = useState<Confluence.User|null>(null);
  const [ error, setError ] = useState<Error>();

  useEffect(() => {
    if (!AP) {
      setUser(null);
      setError(new Error('Cannot retrieve Confluence user, hook is executed outside of context of Atlassian host product'));
      setLoading(false);
    } else if (!service) {
      setUser(null);
      setError(new Error('Failed to connect to Confluence API, ConfluenceClientService is missing'));
      setLoading(false);
    } else if (!isOfType(AP, 'confluence')) {
      setUser(null);
      setError(new Error('Cannot retrieve Confluence user, hook is executed outside of context of Confluence host product'));
      setLoading(false);
    } else {
      new Promise<string>(resolve => accountId ? resolve(accountId) : AP.user.getCurrentUser(({ atlassianAccountId }) => resolve(atlassianAccountId)))
        .then(id => {
          if (!id) {
            return Promise.reject(new Error('Could not retrieve Confluence user, account ID was not found'));
          } else {
            return service.getUser(id);
          }
        })
        .then(setUser)
        .catch((err) => {
          setUser(null);
          setError(err);
          setLoading(false);
        }).finally(() => setLoading(false));
    }
  }, []);

  return [ user, isLoading, error ];
}