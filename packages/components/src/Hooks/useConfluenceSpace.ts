import { isOfType } from '@collabsoft-net/helpers';
import { useQuery } from '@tanstack/react-query';

import { useConfluenceSpacePermissions } from './useConfluenceSpacePermission';
import { usePlatformBridge } from './usePlatformBridge';

export const useConfluenceSpace = (spaceIdOrKey: string|number, requiredPermission?: Confluence.ContentOperation, accountId?: string, requiredPermissionsMode?: 'ALL'|'ANY', options?: Confluence.SpaceRequestOptions|Confluence.SpaceV2RequestOptions, expiresInSeconds?: number): [ Confluence.Space|Confluence.SpaceV2|undefined, boolean|undefined, boolean, Error|null ] => {

  const bridge = usePlatformBridge();

  const { data: space, isLoading: isLoadingSpace, error: spaceError } = useQuery<Confluence.Space|Confluence.SpaceV2|undefined, Error>({
    queryKey: [ 'ConfluenceClientService.getSpace()', spaceIdOrKey, JSON.stringify(options), requiredPermission, accountId ],
    queryFn: () => isOfType(bridge.client, 'getSpace') ? bridge.client.getSpace(spaceIdOrKey, options) : undefined,
    staleTime: expiresInSeconds ? expiresInSeconds * 1000 : undefined,
    enabled: isOfType(bridge.client, 'getSpace') && typeof spaceIdOrKey !== 'undefined'
  });

  const checkForPermissions = typeof space !== 'undefined' && typeof accountId !== 'undefined' && typeof requiredPermission !== 'undefined';

  const [ hasRequiredPermissions, isLoadingPermissions, permissionsError ] =
    checkForPermissions
      ? useConfluenceSpacePermissions(requiredPermission, spaceIdOrKey, accountId, requiredPermissionsMode)
      : [ undefined, false, null ];

  const loading = isLoadingSpace || isLoadingPermissions;
  const error = spaceError || permissionsError;

  return [ space, hasRequiredPermissions, loading, error ];
}