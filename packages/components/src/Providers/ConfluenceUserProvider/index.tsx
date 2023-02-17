import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import { ConfluenceClientService } from '@collabsoft-net/services';
import { useEffect, useState } from 'react';

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

let service: ConfluenceClientService;
let AP: AP.Instance;

kernel.onReady(() => {
  if (kernel.isBound(ConfluenceClientService.getIdentifier())) {
    service = kernel.get<ConfluenceClientService>(ConfluenceClientService.getIdentifier());
  } else {
    throw new Error(`Could not find instance of ConfluenceClientService, please make sure to bind it in your Inversify configuration using "ConfluenceClientService.getIdentifier()"`);
  }

  if (kernel.isBound(ServiceIdentifier.AP)) {
    AP = kernel.get<AP.Instance>(ServiceIdentifier.AP);
  } else {
    throw new Error(`Could not find instance of AP, please make sure to bind it in your Inversify configuration using "ServiceIdentifier.AP"`);
  }
});

export const ConfluenceUserProvider = ({ accountId, loadingMessage, cacheDuration, children }: ConfluenceUserProviderProps): JSX.Element => {
  const [ user, setUser ] = useState<Confluence.User>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    if (AP && service) {
      const ConfluenceClientService = cacheDuration ? service.cached(cacheDuration) : service;
      new Promise<string>(resolve => resolve(accountId)).then(id =>
        ConfluenceClientService.getUser(id).then(async (result) => {
          setUser(result);
        })
      ).catch(setErrors).finally(() => setLoading(false));
    }
  }, [ AP, service ]);

  return loading && loadingMessage ? loadingMessage : children({ user, loading, errors });
}