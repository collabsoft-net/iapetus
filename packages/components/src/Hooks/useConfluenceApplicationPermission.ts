import { useContext, useEffect, useState } from 'react';

import { ConfluenceClientService } from '../Contexts';
import { useConfluenceUser } from './useConfluenceUser';

export const useConfluenceApplicationPermissions = (operation: Confluence.ContentOperation, accountId?: string) => {

  const service = useContext(ConfluenceClientService);
  const [ user, isLoadingUser, userError ] = useConfluenceUser(accountId);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();
  const [ error, setError ] = useState<Error>();

  useEffect(() => {
    if (!isLoadingUser) {
      if (!operation) {
        setHasPermissions(true);
        setLoading(false);
      } else if (!service) {
        setHasPermissions(undefined);
        setError(new Error('Failed to connect to Confluence API, ConfluenceClientService is missing'));
        setLoading(false);
      } else if (!user) {
        setHasPermissions(undefined);
        setError(userError || new Error('Could not determine Confluence permissions, User was not found'));
        setLoading(false);
      } else {
        service.hasApplicationPermission(user.accountId, operation)
          .then(setHasPermissions)
          .catch((err) => {
            setHasPermissions(undefined)
            setError(err)
          }).finally(() => setLoading(false))
      }
    }
  }, [ service, isLoadingUser ]);

  return [ hasPermissions, isLoading, error ];
}