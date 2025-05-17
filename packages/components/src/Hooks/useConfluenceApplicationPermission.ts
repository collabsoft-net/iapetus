import { useGlobalPermission } from './useGlobalPermission';

export const useConfluenceApplicationPermissions = (operation: Confluence.ContentOperation, accountId?: string, mode?: 'ALL'|'ANY') =>
  useGlobalPermission(operation, accountId as string, mode);