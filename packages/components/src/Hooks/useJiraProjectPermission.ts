import { Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { JiraClientService } from '@collabsoft-net/services';
import { useQuery } from '@tanstack/react-query';

import { useProductClientService } from './useProductClientService';

export function useJiraProjectPermissions(project: Jira.Project, permissions: string|Array<string>, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(projectId: number, permissions: string|Array<string>, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(projects: Array<number>, permissions: string|Array<string>, accountId: string, mode?: 'ALL'|'ANY'): [ boolean|undefined, boolean, Error|null ];
export function useJiraProjectPermissions(projectOrIdOrIds: Jira.Project|number|Array<number>, permissions: string|Array<string>, accountId: string, mode: 'ALL'|'ANY' = 'ALL'): [ boolean|undefined, boolean, Error|null ] {
  const service = useProductClientService<JiraClientService<Modes>>();

  const requiredPermissions = Array.isArray(permissions) ? permissions : [ permissions ];
  const projects: Array<number> = isOfType<Jira.Project>(projectOrIdOrIds, 'id') ? [ Number(projectOrIdOrIds.id) ] : typeof projectOrIdOrIds === 'number' ? [ projectOrIdOrIds ] : projectOrIdOrIds;

  const { data: permitted, isLoading: isLoadingPermissions, isFetching: isFetchingPermissions, error: permissionsError } = useQuery<boolean|undefined, Error>({
    queryKey: [ 'JiraClientService.hasPermissions', accountId, requiredPermissions.join(','), mode ],
    queryFn: () => service.hasPermissions(accountId, [ { projects, permissions: requiredPermissions }], undefined, mode).catch(() => false)
  });

  const isLoading = isLoadingPermissions || isFetchingPermissions;
  const error = permissionsError;

  return [ permitted, isLoading, error ];
}