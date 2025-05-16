import { useCurrentAccountId } from './useCurrentAccountId';
import { useGlobalPermission } from './useGlobalPermission';

export function useJiraGlobalPermissions(permissions: Array<string>, accountId?: string, mode: 'ALL'|'ANY' = 'ALL'): [ boolean|undefined, boolean, Error|null ] {
  const [ currentAccountId, isLoadingAccountId ] = useCurrentAccountId();
  const atlassianAccountId = accountId || currentAccountId;
  const checkForPermissions = !isLoadingAccountId && atlassianAccountId;

  const [ hasPermission, isLoading, error ] = checkForPermissions
    ? useGlobalPermission(permissions, atlassianAccountId, mode)
    : [ undefined, true, null ];

  return [ hasPermission, isLoading, error];
}