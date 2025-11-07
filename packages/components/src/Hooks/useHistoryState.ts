import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { QueryObserverResult, RefetchOptions, useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query'

import { usePlatformBridge } from './usePlatformBridge';

export const HistoryStateQueryKey = [ 'bridge.history.getState()' ]

const getHistoryState = (state: string|Platform.HistoryState): Record<string, string> => {
  const result: Record<string, string> = {};

  const query = new URLSearchParams(state);
  query.forEach((value, key) => {
    const values = result[key]?.split(',') || [];
    values.push(value)
    result[key] = values.join(',')
  });

  return result;
}

export const useHistoryState = <T extends Record<string, string>> (): [ T, UseMutationResult<string, Error, Partial<T>>, (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<Record<string, string>, unknown>> ] => {

  const bridge = usePlatformBridge();
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: HistoryStateQueryKey,
    queryFn: () => new Promise<string|Platform.HistoryState>(resolve => bridge.history.getState('hash', resolve)),
    select: (state) => getHistoryState(state),
    initialData: '',
  });

  const setState = useMutation<string, Error, Partial<T>>({
    mutationFn: (state) => {
      const query = new URLSearchParams();
      Object.entries(state).forEach(([ key, value ]) => {
        if (typeof value === 'string' && !isNullOrEmpty(value)) {
          query.set(key, value);
        }
      });
      bridge.history.pushState(query.toString());
      return Promise.resolve(query.toString() || '');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(HistoryStateQueryKey, () => data || '');
    }
  });

  return [ data as unknown as T, setState, refetch ];
}