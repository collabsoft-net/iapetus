import { useJiraProject, useJiraUser } from '../../Hooks';

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
  const permissions = requiredPermissions ? Array.isArray(requiredPermissions) ? requiredPermissions : [ requiredPermissions ] : undefined;
  const [ user, isLoadingJiraUser ] = permissions ? useJiraUser() : [ undefined, false ];
  const accountId = user?.accountId || user?.key;

  const [ project, permitted, isLoadingProject, error ] = !isLoadingJiraUser
    ? useJiraProject(projectIdOrKey, permissions, accountId, requiredPermissionsMode, { expand, properties, expiresInSeconds })
    : [ undefined, undefined, true, null ];

  const loading = isLoadingJiraUser || isLoadingProject;
  return loading && loadingMessage ? loadingMessage : children({ project, permitted, loading, errors: error });
}