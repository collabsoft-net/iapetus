import { useContext, useEffect,useState } from 'react';

import { AP as APContext } from '../../Contexts/AP';
import { ConfluenceClientService } from '../../Contexts/ConfluenceClientService';
import { useConfluenceUser } from '../../Hooks';

interface ConfluenceSpaceProviderProps {
  spaceIdOrKey: string|number|PromiseLike<string|number>;
  requiredPermission?: Confluence.ContentOperation;
  options?: Confluence.SpaceV2RequestOptions|Confluence.SpaceRequestOptions;
  loadingMessage?: JSX.Element;
  cacheDuration?: number;
  children: (args: {
    space?: Confluence.Space|Confluence.SpaceV2;
    permitted?: boolean;
    errors?: Error;
    loading: boolean;
  }) => JSX.Element;
}

export const ConfluenceSpaceProvider = ({ spaceIdOrKey, requiredPermission, options, loadingMessage, cacheDuration, children }: ConfluenceSpaceProviderProps): JSX.Element => {

  const AP = useContext(APContext);
  const confluenceClientService = useContext(ConfluenceClientService);
  const [ user ] = useConfluenceUser();

  const [ space, setSpace ] = useState<Confluence.Space|Confluence.SpaceV2>();
  const [ permitted, setPermitted ] = useState<boolean>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    if (!AP) {
      setErrors(new Error(`Failed to retrieve instance of AP, please make sure the AP context is inititalized`));
      setLoading(false);
    } else if (!confluenceClientService) {
      setErrors(new Error(`Failed to retrieve instance of ConfluenceClientService, please make sure the ConfluenceClientService context is inititalized`));
      setLoading(false);
    } else if (user) {
      const service = cacheDuration ? confluenceClientService.cached(cacheDuration) : confluenceClientService;
      new Promise<string|number>(resolve => resolve(spaceIdOrKey))
        .then(idOrKey => service.getSpace(idOrKey, options))
        .then(space => {
          setSpace(space);
          if (requiredPermission) {
            const accountId = user.accountId || user.userKey;
            return service.hasSpacePermission(space.key, requiredPermission, accountId)
              .then(setPermitted).catch(() => setPermitted(false));
          } else {
            setPermitted(true);
          }
          return;
        }).catch(setErrors).finally(() => setLoading(false));
    }
  }, [ user ])

  return loading && loadingMessage ? loadingMessage : children({ space, permitted, loading, errors });
}