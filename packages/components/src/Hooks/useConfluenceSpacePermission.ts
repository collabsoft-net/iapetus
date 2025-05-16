import { useCurrentAccountId } from './useCurrentAccountId';
import { useEntityPermission } from './useEntityPermission';
import { useProductContext } from './useProductContext';

export const useConfluenceSpacePermissions = (operation: Confluence.ContentOperation, spaceIdOrKey?: string|number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ] => {
  const [ context, isLoadingContext ] = useProductContext<AP.ConfluenceContext>();
  const entityId = spaceIdOrKey || context?.confluence.space.key;

  const [ currentAccountId, isLoadingAccountId ] = useCurrentAccountId();
  const atlassianAccountId = accountId || currentAccountId;

  const checkForPermissions = (!isLoadingContext && entityId) && (!isLoadingAccountId && atlassianAccountId);

  const [ hasPermission, isLoading, error ] = checkForPermissions
    ? useEntityPermission('space', operation, entityId, atlassianAccountId, mode)
    : [ undefined, true, null ];

  return [ hasPermission, isLoading, error];
}