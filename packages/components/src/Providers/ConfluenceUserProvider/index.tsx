import { useContext, useEffect, useState } from 'react';

import { ConfluenceClientService } from '../../Contexts/ConfluenceClientService';

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

  const service = useContext(ConfluenceClientService);

  const [ user, setUser ] = useState<Confluence.User>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    if (service) {
      const instance = cacheDuration ? service.cached(cacheDuration) : service;
      new Promise<string>(resolve => resolve(accountId))
        .then(id => instance.getUser(id).then(setUser))
        .catch(setErrors)
        .finally(() => setLoading(false));
    } else {
      setErrors(new Error(`Failed to retrieve instance of ConfluenceClientService, please make sure the ConfluenceClientService context is inititalized`));
      setLoading(false);
    }
  }, [ service ]);

  return loading && loadingMessage ? loadingMessage : children({ user, loading, errors });
}