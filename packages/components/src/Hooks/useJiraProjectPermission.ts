import { isOfType } from '@collabsoft-net/helpers';

import { useEntityPermission } from './useEntityPermission';
import { useProductContext } from './useProductContext';

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

  const projects: Array<number> =
    isOfType<Jira.Project>(projectOrIdOrKeyOrAccountId, 'id')
      ? [ Number(projectOrIdOrKeyOrAccountId.id) ]
      : typeof projectOrIdOrKeyOrAccountId === 'number'
        ? [ projectOrIdOrKeyOrAccountId ]
        : Array.isArray(projectOrIdOrKeyOrAccountId)
          ? projectOrIdOrKeyOrAccountId
          : [];

  const accountId = typeof projectOrIdOrKeyOrAccountId === 'string'
    ? projectOrIdOrKeyOrAccountId
    : accountIdOrMode !== 'ANY' && accountIdOrMode !== 'ALL'
      ? accountIdOrMode
      : undefined;

  const [ context, isLoadingContext ] = useProductContext<AP.JiraContext>();
  if (context && projects.length === 0) {
    projects.push(Number(context.jira.project.id));
  }

  const [ permitted, isLoadingPermissions, errors ] = useEntityPermission('project', permissions, projects, accountId, mode);

  const isLoading = (projects.length === 0 && isLoadingContext) || isLoadingPermissions;
  return [ permitted, isLoading, errors ];
}