import { useContext, useEffect,useState } from 'react';

import { JiraClientService } from '../Contexts/JiraClientService';
import { useJiraPermissions } from './useJiraPermission';

export const useJiraProject = (projectId: number, requiredPermissions?: Array<string>, expand?: Array<'description' | 'issueTypes' | 'lead' | 'projectKeys' | 'issueTypeHierarchy'>) => {

  const service = useContext(JiraClientService);

  const [ project, setProject ] = useState<Jira.Project>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ error, setError ] = useState<Error>();

  const [ hasRequiredPermissions, isLoadingPermissions, jiraPermissionsError ] = useJiraPermissions([
    {
      projects: [ projectId ],
      permissions: requiredPermissions || []
    }
  ]);

  useEffect(() => {
    if (!isLoadingPermissions) {
      if (!service) {
        setProject(undefined);
        setError(new Error('Failed to connect to Atlassian API, JiraClientService is missing'));
        setLoading(false);
      } else if (jiraPermissionsError) {
        setProject(undefined);
        setError(jiraPermissionsError);
        setLoading(false);
      } else {
        service.getProject(projectId, expand)
          .then(setProject)
          .catch((err) => {
            setProject(undefined);
            setError(err);
          }).finally(() => setLoading(false));
      }
    }
  }, [ isLoadingPermissions ]);

  return [ project, hasRequiredPermissions, loading, error ];
}