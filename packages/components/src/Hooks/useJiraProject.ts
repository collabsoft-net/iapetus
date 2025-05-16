import { Modes } from '@collabsoft-net/enums';
import { JiraClientService } from '@collabsoft-net/services';
import { useQuery } from '@tanstack/react-query';

import { useJiraProjectPermissions } from './useJiraProjectPermission';
import { useProductClientService } from './useProductClientService';

interface UseJiraProjectOptions {
  expand?: Array<'description' | 'issueTypes' | 'lead' | 'projectKeys' | 'issueTypeHierarchy'>;
  properties?: Array<string>;
  expiresInSeconds?: number
}

export const useJiraProject = (projectIdOrKey: string|number, requiredPermissions?: Array<string>, accountId?: string, requiredPermissionsMode?: 'ALL'|'ANY', options?: UseJiraProjectOptions): [ Jira.Project|undefined, boolean|undefined, boolean, Error|null ] => {

  const service = useProductClientService<JiraClientService<Modes>>();

  const { data: project, isLoading: isLoadingProject, isFetching: isFetchingProject, error: projectError } = useQuery<Jira.Project|undefined, Error>({
    queryKey: [ 'JiraClientService.getProject()', projectIdOrKey, options?.expand?.join(','), options?.properties?.join(',') ],
    queryFn: () => service.getProject(projectIdOrKey, options?.expand, options?.properties),
    staleTime: options?.expiresInSeconds ? options.expiresInSeconds * 1000 : undefined,
    enabled: typeof service !== 'undefined' && typeof projectIdOrKey !== 'undefined'
  });

  const checkForPermissions = typeof project !== 'undefined' && typeof accountId !== 'undefined' && typeof requiredPermissions !== 'undefined';

  const [ hasRequiredPermissions, isLoadingPermissions, jiraPermissionsError ] =
    checkForPermissions
      ? useJiraProjectPermissions(project, requiredPermissions || [], accountId, requiredPermissionsMode)
      : [ undefined, false, null ];

  const loading = isLoadingProject || isFetchingProject || isLoadingPermissions;
  const error = projectError || jiraPermissionsError;

  return [ project, hasRequiredPermissions, loading, error ];
}