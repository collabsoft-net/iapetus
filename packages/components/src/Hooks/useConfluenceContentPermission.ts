import { useEntityPermission } from './useEntityPermission';

export const useConfluenceContentPermissions = (operation: Confluence.ContentOperation, contentId?: string, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ] =>
  useEntityPermission('content', operation, contentId as string, accountId as string, mode);
