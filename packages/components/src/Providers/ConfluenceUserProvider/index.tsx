import { useContext, useEffect, useState } from 'react';

import { ConfluenceClientServiceProvider } from '../../Contexts/ConfluenceClientServiceProvider';

interface ConfluenceUserProviderProps {
  accountId: string|PromiseLike<string>;
  loadingMessage?: JSX.Element;
  cacheDuration?: number;
  children: (args: {
    user?: Confluence.User;
    errors?: Error;
    loading: boolean;
  }) => JSX.Element;
}

export const ConfluenceUserProvider = ({ accountId, loadingMessage, cacheDuration, children }: ConfluenceUserProviderProps): JSX.Element => {

  const service = useContext(ConfluenceClientServiceProvider);

  const [ user, setUser ] = useState<Confluence.User>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    service.then(async service => {
      const ConfluenceClientService = cacheDuration ? service.cached(cacheDuration) : service;
      const id = await new Promise<string>(resolve => resolve(accountId));
      return await ConfluenceClientService.getUser(id).then(setUser);
    }).catch(setErrors).finally(() => setLoading(false));
  }, [ service ]);

  return loading && loadingMessage ? loadingMessage : children({ user, loading, errors });
}