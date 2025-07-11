import { isOfType } from '@collabsoft-net/helpers';
import { useQuery } from '@tanstack/react-query';

import { useContentContext } from './useContentContext';
import { useJiraProjectPermissions } from './useJiraProjectPermission';
import { usePlatformBridge } from './usePlatformBridge';

interface UseJiraProjectOptions {
  expand?: Array<'description' | 'issueTypes' | 'lead' | 'projectKeys' | 'issueTypeHierarchy'>;
  properties?: Array<string>;
  expiresInSeconds?: number
}

export const useJiraProject = (projectIdOrKey?: string|number, requiredPermissions?: Array<string>, accountId?: string, requiredPermissionsMode?: 'ALL'|'ANY', options?: UseJiraProjectOptions): [ Jira.Project|undefined, boolean|undefined, boolean, Error|null ] => {

  const bridge = usePlatformBridge();

  const [ context ] = useContentContext<Platform.JiraContentContext>();
  const idOrKey = projectIdOrKey || context?.project?.id;

  const { data: project, isLoading: isLoadingProject, error: projectError } = useQuery<Jira.Project|undefined, Error>({
    queryKey: [ 'bridge.client.getProject()', projectIdOrKey, options?.expand?.join(','), options?.properties?.join(',') ],
    queryFn: () => isOfType(bridge.client, 'getProject') ? bridge.client.getProject(String(idOrKey), options?.expand, options?.properties) : undefined,
    staleTime: options?.expiresInSeconds ? options.expiresInSeconds * 1000 : undefined,
    enabled: isOfType(bridge.client, 'getProject') && typeof idOrKey !== 'undefined'
  });

  const checkForPermissions = typeof project !== 'undefined' && typeof accountId !== 'undefined' && typeof requiredPermissions !== 'undefined';

  const [ hasRequiredPermissions, isLoadingPermissions, jiraPermissionsError ] =
    checkForPermissions
      ? useJiraProjectPermissions(requiredPermissions || [],project, accountId, requiredPermissionsMode)
      : [ undefined, false, null ];

  const loading = isLoadingProject || isLoadingPermissions;
  const error = projectError || jiraPermissionsError;

  return [ project, hasRequiredPermissions, loading, error ];
}