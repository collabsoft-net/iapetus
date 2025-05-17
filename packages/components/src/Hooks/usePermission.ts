
import { useEntityPermission } from './useEntityPermission';

export function usePermission(type: 'project', permission: 'view'|'edit'|'administer', projectId?: number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'project', permission: 'view'|'edit'|'administer', projectsIds: Array<number>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'issue', permission: 'view'|'edit'|'administer', issueId?: number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'issue', permission: 'view'|'edit'|'administer', issueIds: Array<number>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'content', permission: 'view'|'edit'|'administer', contentId?: number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'content', permission: 'view'|'edit'|'administer', contentIds: Array<number>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'space', permission: 'view'|'edit'|'administer', spaceIdOrKey?: string|number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'space', permission: 'view'|'edit'|'administer', spaceIdsOrKeys: Array<string|number>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function usePermission(type: 'project'|'issue'|'space'|'content', permission: 'view'|'edit'|'administer', singleOrBulkEntityId?: string|number|Array<string|number>, accountId?: string, mode: 'ALL'|'ANY' = 'ALL'): [ boolean|undefined, boolean, Error|null ] {
  const entityIds =
    singleOrBulkEntityId
      ? Array.isArray(singleOrBulkEntityId)
        ? type === 'issue' || type === 'project'
          ? singleOrBulkEntityId.map(Number)
          : singleOrBulkEntityId.map(String)
        : type === 'issue' || type === 'project'
          ? [ Number(singleOrBulkEntityId) ]
          : [ String(singleOrBulkEntityId) ]
      : undefined;

  const requiredPermission =
    type === 'project'
      ? permission === 'view' ? 'BROWSE_PROJECT' : 'ADMINISTER_PROJECT'
      : type === 'issue'
        ? permission === 'view' ? 'BROWSE_PROJECT' : permission === 'edit' ? 'EDIT_ISSUES' : 'ADMINISTER_PROJECT'
        : permission === 'view' ? 'read' : permission === 'edit' ? 'update' : 'administer';

  return (
    type === 'project'
      ? useEntityPermission('project', requiredPermission, entityIds as Array<number>, accountId as string, mode)
      : type === 'issue'
        ? useEntityPermission('issue', requiredPermission, entityIds as Array<number>, accountId as string, mode)
        : type === 'content'
          ? useEntityPermission('content', requiredPermission as Confluence.ContentOperation, entityIds as Array<string>, accountId as string, mode)
          : useEntityPermission('space', requiredPermission as Confluence.ContentOperation, entityIds as Array<string>, accountId as string, mode)
  )
}