import { isOfType } from '@collabsoft-net/helpers';

import { useEntityPermission } from './useEntityPermission';

export function useJiraProjectPermissions(permissions: string|Array<string>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(permissions: string|Array<string>, project: Jira.Project , accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(permissions: string|Array<string>, projectId: number, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(permissions: string|Array<string>, projects: Array<number>, accountId?: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(
  permissions: string|Array<string>,
  projectOrIdOrKeyOrAccountId?: Jira.Project|number|Array<number>|string,
  accountIdOrMode?: string|'ALL'|'ANY',
  mode: 'ALL'|'ANY' = 'ALL'
): [ boolean|undefined, boolean, Error|null ] {

  const projects: Array<number>|undefined =
    isOfType<Jira.Project>(projectOrIdOrKeyOrAccountId, 'id')
      ? [ Number(projectOrIdOrKeyOrAccountId.id) ]
      : typeof projectOrIdOrKeyOrAccountId === 'number'
        ? [ projectOrIdOrKeyOrAccountId ]
        : Array.isArray(projectOrIdOrKeyOrAccountId)
          ? projectOrIdOrKeyOrAccountId
          : undefined;

  const accountId = typeof projectOrIdOrKeyOrAccountId === 'string'
    ? projectOrIdOrKeyOrAccountId
    : accountIdOrMode !== 'ANY' && accountIdOrMode !== 'ALL'
      ? accountIdOrMode
      : undefined;

  return useEntityPermission('project', permissions, projects as Array<number>, accountId as string, mode);
}