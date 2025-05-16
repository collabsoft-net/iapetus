import { useCurrentAccountId } from './useCurrentAccountId';
import { useEntityPermission } from './useEntityPermission';
import { useProductContext } from './useProductContext';

export const useConfluenceContentPermissions = (operation: Confluence.ContentOperation, contentId?: string, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ] => {
  const [ context, isLoadingContext ] = useProductContext<AP.ConfluenceContext>();
  const entityId = contentId || context?.confluence.content.id;

  const [ currentAccountId, isLoadingAccountId ] = useCurrentAccountId();
  const atlassianAccountId = accountId || currentAccountId;

  const checkForPermissions = (!isLoadingContext && entityId) && (!isLoadingAccountId && atlassianAccountId);

  const [ hasPermission, isLoading, error ] = checkForPermissions
    ? useEntityPermission('content', operation, entityId, atlassianAccountId, mode)
    : [ undefined, true, null ];

  return [ hasPermission, isLoading, error];
}