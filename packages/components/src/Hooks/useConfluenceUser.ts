import { useContext, useEffect, useState } from 'react';

import { AP as APContext , ConfluenceClientService } from '../Contexts';

export const useConfluenceUser = (accountId?: string): [ Confluence.User|null, boolean ] => {

  const AP = useContext(APContext);
  const service = useContext(ConfluenceClientService);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ user, setUser ] = useState<Confluence.User|null>(null);

  useEffect(() => {
    if (AP && service) {
      new Promise<string>(resolve => accountId
        ? resolve(accountId)
        : AP.user.getCurrentUser(({ atlassianAccountId }) => resolve(atlassianAccountId))
      ).then(id => service.getUser(id)).then(setUser).finally(() => setLoading(false));
    }
  }, [ AP, service ]);

  return [ user, isLoading ];
}