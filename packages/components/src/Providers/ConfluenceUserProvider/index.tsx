import { useContext, useEffect, useState } from 'react';

import { ConfluenceClientServiceContext } from '../../Contexts/ConfluenceClientServiceContext';

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

  const provider = useContext(ConfluenceClientServiceContext);

  const [ user, setUser ] = useState<Confluence.User>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    provider.then(async instance => {
      if (instance) {
        const service = cacheDuration ? instance.cached(cacheDuration) : instance;
        const id = await new Promise<string>(resolve => resolve(accountId));
        return await service.getUser(id).then(setUser);
      } else {
        setErrors(new Error(`Could not find instance of ConfluenceClientService, please make sure to bind it in your Inversify configuration using "ConfluenceClientService.getIdentifier()"`));
      }
    }).catch(setErrors).finally(() => setLoading(false));
  }, [ provider ]);

  return loading && loadingMessage ? loadingMessage : children({ user, loading, errors });
}