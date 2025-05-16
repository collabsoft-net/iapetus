
import { isOfType } from '@collabsoft-net/helpers';
import { useQuery } from '@tanstack/react-query';

import { useACJS } from './useACJS';

export const useProductContext = <T extends AP.JiraContext|AP.ConfluenceContext|AP.BambooContext> (): [ T|undefined, boolean, Error|null ] => {
  const ACJS = useACJS();

  const { data: context, isLoading: isLoadingContext, isFetching: isFetchingContext, error } = useQuery<T, Error>({
    queryKey: [ 'AP.context.getContext()' ],
    queryFn: async () => isOfType(ACJS, 'context')
      ? ACJS.context.getContext() as Promise<T>
      : Promise.reject(new Error('Cannot retrieve context, hook is executed outside of supported Atlassian host product'))
  });

  const isLoading = isLoadingContext || isFetchingContext;
  return [ context, isLoading, error ];
}
