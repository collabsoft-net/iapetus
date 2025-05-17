import { useEntityPermission } from './useEntityPermission';

export const useConfluenceSpacePermissions = (operation: Confluence.ContentOperation, spaceIdOrKey?: string|number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ] =>
  useEntityPermission('space', operation, spaceIdOrKey as string|number, accountId as string, mode)
