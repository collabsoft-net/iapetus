

import { Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { useQuery } from '@tanstack/react-query';

import { useCurrentAccountId } from './useCurrentAccountId';
import { useProductClientService } from './useProductClientService';

export const useGlobalPermission = (permissions: string|Array<string>, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ] => {
  const requiredPermissions = Array.isArray(permissions) ? permissions : [ permissions ];

  const service = useProductClientService<JiraClientService<Modes>|ConfluenceClientService<Modes>>();
  if (!isOfType<JiraClientService<Modes>>(service, 'hasPermissions') && !isOfType<ConfluenceClientService<Modes>>(service, 'hasApplicationPermission')) {
    return [ undefined, false, new Error('Cannot check for permissions, hook is executed outside of context of supported Atlassian host product') ];
  }

  const [ currentAccountId, isLoadingAccountId ] = useCurrentAccountId();
  const atlassianAccountId = accountId || currentAccountId;

  if (!isLoadingAccountId && typeof atlassianAccountId === 'undefined') {
    return [ undefined, false, new Error('Cannot check for permissions, user account ID is required') ];
  }

  const jiraGlobalPermissionsQuery = useQuery<boolean|undefined, Error>({
    queryKey: [ 'JiraClientService.hasPermissions()', String(atlassianAccountId), requiredPermissions.join(','), mode ],
    queryFn: () => isOfType<JiraClientService<Modes>>(service, 'hasPermissions')
    ? service.hasPermissions(String(atlassianAccountId), undefined, requiredPermissions, mode).catch(() => false)
    : Promise.reject(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Jira')),
    enabled: isOfType<JiraClientService<Modes>>(service, 'hasPermissions') && typeof atlassianAccountId !== 'undefined'
  });

  const confluenceGlobalPermissionsQuery = useQuery<boolean|undefined, Error>({
    queryKey: [ 'ConfluenceClientService.hasApplicationPermission()', String(atlassianAccountId), requiredPermissions.join(','), mode ],
    queryFn: () => isOfType<ConfluenceClientService<Modes>>(service, 'hasApplicationPermission')
    ? service.hasApplicationPermission(String(atlassianAccountId), requiredPermissions[0] as Confluence.ContentOperation).catch(() => false)
    : Promise.reject(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Confluence')),
    enabled: isOfType<ConfluenceClientService<Modes>>(service, 'hasApplicationPermission') && typeof atlassianAccountId !== 'undefined'
  });

  const { data: hasPermissions, isLoading, error } =
    isOfType<JiraClientService<Modes>>(service, 'hasPermissions')
      ? jiraGlobalPermissionsQuery
      : confluenceGlobalPermissionsQuery;

  return [ hasPermissions, isLoading, error ];
}