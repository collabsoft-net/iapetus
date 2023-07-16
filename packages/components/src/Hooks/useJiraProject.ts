import { useContext, useEffect,useState } from 'react';

import { JiraClientService } from '../Contexts/JiraClientService';
import { useJiraPermissions } from './useJiraPermission';

export const useJiraProject = (projectId: number, requiredPermissions?: Array<string>, expand?: Array<'description' | 'issueTypes' | 'lead' | 'projectKeys' | 'issueTypeHierarchy'>) => {

  const service = useContext(JiraClientService);

  const [ project, setProject ] = useState<Jira.Project>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  const [ hasRequiredPermissions ] = useJiraPermissions([
    {
      projects: [ projectId ],
      permissions: requiredPermissions || []
    }
  ]);

  useEffect(() => {
    if (service) {
      service.getProject(projectId, expand)
        .then(setProject)
        .catch(setErrors)
        .finally(() => setLoading(false));
    }
  }, [ service ]);

  return [ project, hasRequiredPermissions, loading, errors ];
}