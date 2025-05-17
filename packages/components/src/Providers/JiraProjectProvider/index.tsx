import { useJiraProject } from '../../Hooks';

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
  const [ project, permitted, loading, error ] = useJiraProject(projectIdOrKey, permissions, undefined, requiredPermissionsMode, { expand, properties, expiresInSeconds })
  return loading && loadingMessage ? loadingMessage : children({ project, permitted, loading, errors: error });
}