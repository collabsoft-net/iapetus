import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import { JiraClientService } from '../../Contexts/JiraClientService';
import { useJiraUser } from '../../Hooks';

interface JiraProjectProviderProps {
  projectIdOrKey: string|number;
  requiredPermissions?: string|Array<string>;
  requiredPermissionsMode?: 'ALL'|'ANY';
  expand?: Array<'description'|'issueTypes'|'lead'|'projectKeys'|'issueTypeHierarchy'>;
  properties?: Array<string>;
  loadingMessage?: JSX.Element;
  expiresInSeconds?: number;
  children: (args: {
    project?: Jira.Project;
    permitted?: boolean;
    errors: Error|null;
    loading: boolean;
  }) => JSX.Element;
}

export const JiraProjectProvider = ({ projectIdOrKey, requiredPermissions, requiredPermissionsMode, expand, properties, loadingMessage, expiresInSeconds, children }: JiraProjectProviderProps): JSX.Element => {
  const jiraClientService = useContext(JiraClientService);

  const [ user ] = useJiraUser();
  const accountId = user?.accountId || user?.key;

  const { data: project, isLoading: isLoadingProject, isFetching: isFetchingProject, error: projectError } = useQuery<Jira.Project|undefined, Error>({
    queryKey: [ 'JiraClientService.getProject()', projectIdOrKey, expand?.join(','), properties?.join(',') ],
    queryFn: () => jiraClientService?.getProject(projectIdOrKey, expand, properties),
    staleTime: expiresInSeconds ? expiresInSeconds * 1000 : undefined,
    enabled: typeof jiraClientService !== 'undefined' && typeof projectIdOrKey !== 'undefined'
  });

  const permissions = requiredPermissions ? Array.isArray(requiredPermissions) ? requiredPermissions : [ requiredPermissions ] : [];
  const checkForPermissions = typeof jiraClientService !== 'undefined' && typeof project !== 'undefined' && typeof accountId !== 'undefined' && typeof permissions !== 'undefined';

  const { data: permitted, isLoading: isLoadingPermissions, isFetching: isFetchingPermissions, error: permissionsError } = useQuery<boolean|undefined, Error>({
    queryKey: [ 'JiraClientService.hasPermissions', accountId, permissions.join(','), requiredPermissionsMode ],
    queryFn: () => jiraClientService?.hasPermissions(String(accountId), [ { projects: [ Number(project?.id) ], permissions }], undefined, requiredPermissionsMode).catch(() => false),
    staleTime: expiresInSeconds ? expiresInSeconds * 1000 : undefined,
    enabled: checkForPermissions
  });

  const loading = (isLoadingProject || isFetchingProject) || (checkForPermissions && (isLoadingPermissions || isFetchingPermissions));
  const errors = projectError || permissionsError;

  return loading && loadingMessage ? loadingMessage : children({ project, permitted, loading, errors });
}