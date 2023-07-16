import { isOfType } from '@collabsoft-net/helpers';
import { useContext, useEffect, useState } from 'react';

import { ConfluenceClientService } from '../Contexts';
import { useConfluenceUser } from './useConfluenceUser';
import { useHostContext } from './useHostContext';

export const useConfluenceContentPermissions = (operation?: Confluence.ContentOperation, contentId?: string, accountId?: string) => {

  const service = useContext(ConfluenceClientService);
  const [ user ] = useConfluenceUser(accountId);
  const [ context ] = useHostContext();

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();

  useEffect(() => {
    if (context) {
      if (!operation || !isOfType<AP.ConfluenceContext>(context, 'confluence')) {
        setHasPermissions(true);
        setLoading(false);
      } else if (service && user) {
        const id = contentId || context.confluence.content.id;
        service.hasContentPermission(id, { type: 'user', identifier: user.accountId }, operation)
          .then(setHasPermissions)
          .catch(() => false)
          .finally(() => setLoading(false))
      }
    }
  }, [ service, user, context ]);

  return [ hasPermissions, isLoading ];
}