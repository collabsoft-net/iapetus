
import { useQuery } from '@tanstack/react-query';

import { usePlatformBridge } from './usePlatformBridge';

export const useContentContext = <T extends Platform.JiraContentContext|Platform.ConfluenceContentContext|Platform.BitbucketContentContext> (): [ T|undefined, boolean, Error|null ] => {
  const bridge = usePlatformBridge();

  const { data: context, isLoading, error } = useQuery<T, Error>({
    queryKey: [ 'bridge.context.getContext()' ],
    queryFn: async () => bridge.context.content() as Promise<T>
  });

  return [ context, isLoading, error ];
}
