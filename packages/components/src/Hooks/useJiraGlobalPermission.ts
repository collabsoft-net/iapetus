import { useGlobalPermission } from './useGlobalPermission';

export const useJiraGlobalPermissions = (permissions: Array<string>, accountId?: string, mode: 'ALL'|'ANY' = 'ALL'): [ boolean|undefined, boolean, Error|null ] =>
  useGlobalPermission(permissions, accountId as string, mode);
