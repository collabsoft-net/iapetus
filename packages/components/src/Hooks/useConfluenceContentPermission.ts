import { useContext, useEffect, useState } from 'react';

import { ConfluenceClientService } from '../Contexts';
import { useConfluenceUser } from './useConfluenceUser';

export const useConfluenceContentPermissions = (contentId: string, operation: Confluence.ContentOperation, accountId?: string) => {

  const service = useContext(ConfluenceClientService);
  const [ user ] = useConfluenceUser(accountId);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();

  useEffect(() => {
    if (!operation) {
      setHasPermissions(true);
      setLoading(false);
    } else if (service && user) {
      service.hasContentPermission(contentId, { type: 'user', identifier: user.accountId }, operation)
        .then(setHasPermissions)
        .catch(() => false)
        .finally(() => setLoading(false))
    }
  }, [ service, user ]);

  return [ hasPermissions, isLoading ];
}