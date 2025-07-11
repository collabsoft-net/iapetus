import { useQuery } from '@tanstack/react-query';

import { usePlatformBridge } from './usePlatformBridge';

export const useCurrentAccountId = (): [ string|undefined, boolean, Error|null ] => {

  const bridge = usePlatformBridge();

  const { data: accountId, isLoading, error } = useQuery<string|undefined, Error>({
    queryKey: [ 'bridge.user.getCurrentUser', 'atlassianAccountId' ],
    queryFn: async () => bridge.user.getCurrentUser()
  });

  return [ accountId, isLoading, error ];
}