import { ServiceIdentifier } from '@collabsoft-net/connect';
import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { QueryObserverResult, RefetchOptions, useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query'

import { AP } from '../Contexts';
import { useContext } from './useContext';

const getHistoryState = (state: string|AP.HistoryState): Record<string, string> => {
  const result: Record<string, string> = {};

  const query = new URLSearchParams(state);
  query.forEach((value, key) => {
    const values = result[key]?.split(',') || [];
    values.push(value)
    result[key] = values.join(',')
  });

  return result;
}

export const useHistoryState = <T> (): [ T, UseMutationResult<string, Error, Partial<T>>, (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<Record<string, string>, unknown>> ] => {

  const queryClient = useQueryClient();
  const ACJS = useContext<AP.PlatformInstance>(AP, ServiceIdentifier.AP);

  const { data, refetch } = useQuery({
    queryKey: [ 'ACJS.history.getState()' ],
    queryFn: () => new Promise<string|AP.HistoryState>(resolve => ACJS.history.getState('hash', resolve)),
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
      ACJS.history.pushState(query.toString());
      return Promise.resolve(query.toString() || '');
    },
    onSuccess: (data) => {
      queryClient.setQueryData([ 'ACJS.history.getState()' ], () => data || '');
    }
  });

  return [ data as unknown as T, setState, refetch ];
}