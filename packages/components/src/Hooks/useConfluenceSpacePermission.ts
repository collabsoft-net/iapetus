import { isOfType } from '@collabsoft-net/helpers';
import { useContext, useEffect, useState } from 'react';

import { ConfluenceClientService } from '../Contexts';
import { useConfluenceUser } from './useConfluenceUser';
import { useHostContext } from './useHostContext';

export const useConfluenceSpacePermissions = (operation?: Confluence.ContentOperation, spaceId?: string, accountId?: string) => {

  const service = useContext(ConfluenceClientService);
  const [ user, isLoadingUser, userError ] = useConfluenceUser(accountId);
  const [ context, isLoadingContext ] = useHostContext();

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();
  const [ error, setError ] = useState<Error>();

  useEffect(() => {
    if (!isLoadingUser && !isLoadingContext) {
      if (!operation) {
        setHasPermissions(true);
        setLoading(false);
      } else if (!isOfType<AP.ConfluenceContext>(context, 'confluence')) {
        setHasPermissions(undefined);
        setError(new Error('Cannot determine Confluence content permissions, hook is executed outside of context of Confluence host product'));
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
        const id = spaceId || context.confluence.space.id;
        if (!id) {
          setHasPermissions(undefined);
          setError(new Error('Could not determine Confluence permissions, space ID was not found'));
          setLoading(false);
        } else {
          const accountId = user?.accountId || (isOfType<Jira.User>(user, 'key') ? user?.key : user?.userKey);
          service.hasSpacePermission(id, operation, accountId)
            .then(setHasPermissions)
            .catch((err) => {
              setHasPermissions(false);
              setError(err);
            }).finally(() => setLoading(false))
        }
      }
    }
  }, [ service, isLoadingUser, isLoadingContext ]);

  return [ hasPermissions, isLoading, error ];
}