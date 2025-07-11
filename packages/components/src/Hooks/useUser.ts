import { isOfType } from '@collabsoft-net/helpers';
import { useQuery } from '@tanstack/react-query';

import { usePlatformBridge } from './usePlatformBridge';

export const useUser = <T extends Jira.User|Confluence.User> (accountId: string, expiresInSeconds?: number): [ T|undefined, boolean, Error|null ] => {
  const bridge = usePlatformBridge();

  const { data: user, isLoading, error } = useQuery<T|undefined, Error>({
    queryKey: [ 'bridge.client.getUser()', accountId ],
    queryFn: async () => isOfType(bridge.client, 'getUser') ? bridge.client.getUser(accountId) as Promise<T> : undefined,
    staleTime: expiresInSeconds ? expiresInSeconds * 1000 : undefined,
    enabled: isOfType(bridge.client, 'getUser')
  });

  return [ user, isLoading, error ];
}