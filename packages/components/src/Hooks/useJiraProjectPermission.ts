import { isOfType } from '@collabsoft-net/helpers';

import { useCurrentAccountId } from './useCurrentAccountId';
import { useEntityPermission } from './useEntityPermission';

export function useJiraProjectPermissions(project: Jira.Project, permissions: string|Array<string>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(projectId: number, permissions: string|Array<string>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(projects: Array<number>, permissions: string|Array<string>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(projectOrIdOrIds: Jira.Project|number|Array<number>, permissions: string|Array<string>, accountId?: string, mode: 'ALL'|'ANY' = 'ALL'): [ boolean|undefined, boolean, Error|null ] {
  const projects: Array<number> = isOfType<Jira.Project>(projectOrIdOrIds, 'id') ? [ Number(projectOrIdOrIds.id) ] : typeof projectOrIdOrIds === 'number' ? [ projectOrIdOrIds ] : projectOrIdOrIds;

  const [ atlassianAccountId, isLoadingAccountId ] = accountId
    ? [ accountId, false ]
    : useCurrentAccountId();

  return (!isLoadingAccountId && atlassianAccountId)
    ? useEntityPermission('project', permissions, projects, atlassianAccountId, mode)
    : [ undefined, true, null ];
}