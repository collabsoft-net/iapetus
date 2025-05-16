import { isOfType } from '@collabsoft-net/helpers';

import { useCurrentAccountId } from './useCurrentAccountId';
import { useEntityPermission } from './useEntityPermission';
import { useProductContext } from './useProductContext';


const getEntityIds = (type: 'project'|'issue'|'space'|'content', singleOrBulkEntityId?: string|number|Array<string|number>, context?: AP.JiraContext|AP.ConfluenceContext): Array<string|number> => {
  const entityIds = singleOrBulkEntityId
    ? Array.isArray(singleOrBulkEntityId)
      ? type === 'issue' || type === 'project'
        ? singleOrBulkEntityId.map(Number)
        : singleOrBulkEntityId.map(String)
      : type === 'issue' || type === 'project'
        ? [ Number(singleOrBulkEntityId) ]
        : [ String(singleOrBulkEntityId) ]
    : isOfType<AP.JiraContext>(context, 'jira') ?
      type === 'project'
        ? [ Number(context?.jira?.project?.id) ]
        : [ Number(context?.jira?.issue?.id) ]
    : isOfType<AP.ConfluenceContext>(context, 'confluence') ?
      type === 'space'
        ? [ context.confluence.space.id ]
        : [ context.confluence.content.id ]
    : [];

  return entityIds;
}

const getPermissionsFor = (type: 'project'|'issue'|'space'|'content', permission: 'view'|'edit'|'administer'): string => {
  if (type === 'project') {
    return permission === 'view' ? 'BROWSE_PROJECT' : 'ADMINISTER_PROJECT';
  } else if (type === 'issue') {
    return permission === 'view' ? 'BROWSE_PROJECT' : permission === 'edit' ? 'EDIT_ISSUES' : 'ADMINISTER_PROJECT';
  } else {
    return permission === 'view' ? 'read' : permission === 'edit' ? 'update' : 'administer';
  }
}

export function usePermission(type: 'project', permission: 'view'|'edit'|'administer', projectId?: number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'project', permission: 'view'|'edit'|'administer', projectsIds: Array<number>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'issue', permission: 'view'|'edit'|'administer', issueId?: number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'issue', permission: 'view'|'edit'|'administer', issueIds: Array<number>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'content', permission: 'view'|'edit'|'administer', contentId?: number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'content', permission: 'view'|'edit'|'administer', contentIds: Array<number>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'space', permission: 'view'|'edit'|'administer', spaceIdOrKey?: string|number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'space', permission: 'view'|'edit'|'administer', spaceIdsOrKeys: Array<string|number>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'project'|'issue'|'space'|'content', permission: 'view'|'edit'|'administer', singleOrBulkEntityId?: string|number|Array<string|number>, accountId?: string, mode: 'ALL'|'ANY' = 'ALL'): [ boolean|undefined, boolean, Error|null ] {
  const [ context, isLoadingContext ] = useProductContext<AP.JiraContext|AP.ConfluenceContext>();

  const [ currentAccountId, isLoadingAccountId ] = useCurrentAccountId();
  const atlassianAccountId = accountId || currentAccountId;
  const checkForPermissions = (!isLoadingContext && context) && (!isLoadingAccountId && atlassianAccountId);

  const entityIds = getEntityIds(type, singleOrBulkEntityId, context);
  const requiredPermission = getPermissionsFor(type, permission);

  const [ hasPermission, isLoading, error ] = checkForPermissions
    ? type === 'project'
      ? useEntityPermission('project', requiredPermission, entityIds as Array<number>, atlassianAccountId, mode)
      : type === 'issue'
        ? useEntityPermission('issue', requiredPermission, entityIds as Array<number>, atlassianAccountId, mode)
        : type === 'content'
          ? useEntityPermission('content', requiredPermission as Confluence.ContentOperation, entityIds as Array<string>, atlassianAccountId, mode)
          : useEntityPermission('space', requiredPermission as Confluence.ContentOperation, entityIds as Array<string>, atlassianAccountId, mode)
    : [ undefined, true, null ];

  return [ hasPermission, isLoading, error ];
}