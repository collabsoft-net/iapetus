import { isOfType } from '@collabsoft-net/helpers';
import { useQuery } from '@tanstack/react-query';

import { useCurrentAccountId } from './useCurrentAccountId';
import { usePlatformBridge } from './usePlatformBridge';

export const useCurrentUser = <T extends Jira.User|Confluence.User> (expiresInSeconds?: number): [ T|undefined, boolean, Error|null ] => {
  const [ accountId, isLoadingAccountId, accountIdError ] = useCurrentAccountId();
  const bridge = usePlatformBridge();

  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery<T|undefined, Error>({
    queryKey: [ 'bridge.client.getUser()', accountId ],
    queryFn: async () => isOfType(bridge.client, 'getUser') ? bridge.client.getUser(accountId as string) as Promise<T> : undefined,
    staleTime: expiresInSeconds ? expiresInSeconds * 1000 : undefined,
    enabled: isOfType(bridge.client, 'getUser') && typeof accountId !== 'undefined'
  });

  const isLoading = isLoadingUser || isLoadingAccountId;
  const error = userError || accountIdError;

  return [ user, isLoading, error ];
}