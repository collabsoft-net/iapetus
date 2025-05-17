

import { Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { useQuery } from '@tanstack/react-query';

import { useCurrentAccountId } from './useCurrentAccountId';
import { useProductClientService } from './useProductClientService';
import { useProductContext } from './useProductContext';

export function useEntityPermission(type: 'issue', permissions: string|Array<string>, issueId: number, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useEntityPermission(type: 'issue', permissions: string|Array<string>, issueIds: Array<number>, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useEntityPermission(type: 'project', permissions: string|Array<string>, projectId: number, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useEntityPermission(type: 'project', permissions: string|Array<string>, projectIds: Array<number>, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useEntityPermission(type: 'content', permissions: Confluence.ContentOperation, contentId: string, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useEntityPermission(type: 'content', permissions: Confluence.ContentOperation, contentIds: Array<string>, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useEntityPermission(type: 'space', permissions: Confluence.ContentOperation, spaceIdOrKey: string|number, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useEntityPermission(type: 'space', permissions: Confluence.ContentOperation, spaceIdsOrKeys: Array<string|number>, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useEntityPermission(type: 'project'|'issue'|'content'|'space', permissions: string|Array<string>|Confluence.ContentOperation, singleOrBulkEntityId: number|string|Array<string|number>, accountId: string, mode: 'ALL'|'ANY' = 'ALL'): [ boolean|undefined, boolean, Error|null ] {
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

  const [ context, isLoadingContext ] = useProductContext<AP.ConfluenceContext>();
  const entityId = singleOrBulkEntityId
    ? singleOrBulkEntityId
    : (type === 'project' || type === 'issue') && isOfType<AP.JiraContext>(context, 'jira')
      ? context.jira[type].id
      : (type === 'content' || type === 'space') && isOfType<AP.ConfluenceContext>(context, 'confluence')
        ? context.confluence[type].id
        : undefined;

  if (!isLoadingContext && typeof entityId === 'undefined') {
    return [ undefined, false, new Error(`Cannot check for permissions, ${type} identifier not provided`) ];
  }

  const jiraIssuePermissionsQuery = useQuery<boolean|undefined, Error>({
    queryKey: [ 'JiraClientService.hasPermissions()', type, entityId, atlassianAccountId, requiredPermissions.join(','), mode ],
    queryFn: () => isOfType<JiraClientService<Modes>>(service, 'hasPermissions')
    ? service.hasPermissions(String(atlassianAccountId), [{
        issues: Array.isArray(entityId) ? entityId.map(Number) : [ entityId ].map(Number),
        permissions: requiredPermissions
      }], undefined, mode).catch(() => false)
    : Promise.reject(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Jira')),
    enabled: type === 'issue' && typeof atlassianAccountId !== 'undefined' && typeof entityId !== 'undefined'
  });

  const jiraProjectPermissionsQuery = useQuery<boolean|undefined, Error>({
    queryKey: [ 'JiraClientService.hasPermissions()', type, entityId, atlassianAccountId, requiredPermissions.join(','), mode ],
    queryFn: () => isOfType<JiraClientService<Modes>>(service, 'hasPermissions')
    ? service.hasPermissions(String(atlassianAccountId), [{
        projects: Array.isArray(entityId) ? entityId.map(Number) : [ entityId ].map(Number),
        permissions: requiredPermissions
      }], undefined, mode).catch(() => false)
    : Promise.reject(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Jira')),
    enabled: type === 'project' && typeof atlassianAccountId !== 'undefined' && typeof entityId !== 'undefined'
  });

  const confluenceContentPermissionsQuery = useQuery<boolean|undefined, Error>({
    queryKey: [ 'ConfluenceClientService.hasContentPermission()', type, entityId, atlassianAccountId, requiredPermissions.join(','), mode ],
    queryFn: async () => {
      if (!isOfType<ConfluenceClientService<Modes>>(service, 'hasContentPermission')) {
        return Promise.reject(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Confluence'));
      } else if (!Array.isArray(entityId)) {
        return service.hasContentPermission(String(entityId), { type: 'user', identifier: String(atlassianAccountId) }, requiredPermissions[0] as Confluence.ContentOperation).catch(() => false)
      } else {
        const allEntityPermissions = await Promise.all(entityId.map(entityId => service.hasContentPermission(String(entityId), { type: 'user', identifier: String(atlassianAccountId) }, requiredPermissions[0] as Confluence.ContentOperation).catch(() => false)));
        return mode === 'ALL' ? allEntityPermissions.every(result => result === true) : allEntityPermissions.some(result => result === true);
      }
    },
    enabled: type === 'content' && typeof atlassianAccountId !== 'undefined' && typeof entityId !== 'undefined'
  });

  const confluenceSpacePermissionsQuery = useQuery<boolean|undefined, Error>({
    queryKey: [ 'ConfluenceClientService.hasSpacePermission()', type, entityId, atlassianAccountId, requiredPermissions.join(','), mode ],
    queryFn: async () => {
      if (!isOfType<ConfluenceClientService<Modes>>(service, 'hasContentPermission')) {
        return Promise.reject(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Confluence'));
      } else if (!Array.isArray(entityId)) {
        return service.hasSpacePermission(String(entityId), requiredPermissions[0] as Confluence.ContentOperation, atlassianAccountId).catch(() => false);
      } else {
        const allEntityPermissions = await Promise.all(entityId.map(entityId => service.hasSpacePermission(String(entityId), requiredPermissions[0] as Confluence.ContentOperation, String(atlassianAccountId)).catch(() => false)));
        return mode === 'ALL' ? allEntityPermissions.every(result => result === true) : allEntityPermissions.some(result => result === true);
      }
    },
    enabled: type === 'space' && typeof atlassianAccountId !== 'undefined' && typeof entityId !== 'undefined'
  });

  const { data: hasPermissions, isLoading: isLoadingPermissions, isFetching: isFetchingPermissions, error } =
    type === 'issue'
    ? jiraIssuePermissionsQuery
    : type === 'project'
      ? jiraProjectPermissionsQuery
      : type === 'content'
        ? confluenceContentPermissionsQuery
        : confluenceSpacePermissionsQuery;

  const isLoading = isLoadingPermissions || isFetchingPermissions;
  return [ hasPermissions, isLoading, error ];

}