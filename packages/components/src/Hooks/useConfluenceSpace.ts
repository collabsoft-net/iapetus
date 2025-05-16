import { Modes } from '@collabsoft-net/enums';
import { ConfluenceClientService } from '@collabsoft-net/services';
import { useQuery } from '@tanstack/react-query';

import { useConfluenceSpacePermissions } from './useConfluenceSpacePermission';
import { useProductClientService } from './useProductClientService';

export const useConfluenceSpace = (spaceIdOrKey: string|number, requiredPermission?: Confluence.ContentOperation, accountId?: string, requiredPermissionsMode?: 'ALL'|'ANY', options?: Confluence.SpaceRequestOptions|Confluence.SpaceV2RequestOptions, expiresInSeconds?: number): [ Confluence.Space|Confluence.SpaceV2|undefined, boolean|undefined, boolean, Error|null ] => {

  const service = useProductClientService<ConfluenceClientService<Modes>>();

  const { data: space, isLoading: isLoadingSpace, isFetching: isFetchingSpace, error: spaceError } = useQuery<Confluence.Space|Confluence.SpaceV2|undefined, Error>({
    queryKey: [ 'ConfluenceClientService.getSpace()', spaceIdOrKey, JSON.stringify(options), requiredPermission, accountId ],
    queryFn: () => service.getSpace(spaceIdOrKey, options),
    staleTime: expiresInSeconds ? expiresInSeconds * 1000 : undefined,
    enabled: typeof service !== 'undefined' && typeof spaceIdOrKey !== 'undefined'
  });

  const checkForPermissions = typeof space !== 'undefined' && typeof accountId !== 'undefined' && typeof requiredPermission !== 'undefined';

  const [ hasRequiredPermissions, isLoadingPermissions, permissionsError ] =
    checkForPermissions
      ? useConfluenceSpacePermissions(requiredPermission, spaceIdOrKey, accountId, requiredPermissionsMode)
      : [ undefined, false, null ];

  const loading = isLoadingSpace || isFetchingSpace || isLoadingPermissions;
  const error = spaceError || permissionsError;

  return [ space, hasRequiredPermissions, loading, error ];
}