import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import { JiraClientService } from '@collabsoft-net/services';
import { useEffect, useState } from 'react';

interface JiraProjectProviderProps {
  projectIdOrKey: string|number;
  requiredPermissions?: string|Array<string>;
  loadingMessage?: JSX.Element;
  children: (args: {
    project?: Jira.Project;
    permitted?: boolean;
    errors?: Error;
    loading: boolean;
  }) => JSX.Element;
}

export const JiraProjectProvider = ({ projectIdOrKey, requiredPermissions, loadingMessage, children }: JiraProjectProviderProps): JSX.Element => {
  const [ AP ] = useState<AP.Instance>(kernel.get<AP.Instance>(ServiceIdentifier.AP));
  const [ service ] = useState(kernel.get<JiraClientService>(JiraClientService.getIdentifier()));
  const [ project, setProject ] = useState<Jira.Project>();
  const [ permitted, setPermitted ] = useState<boolean>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    if (AP && service) {
      service.getProject(projectIdOrKey).then(async (project) => {
        if (requiredPermissions) {
          const accountId = await new Promise<string>(resolve => AP.user.getCurrentUser(({ atlassianAccountId }) => resolve(atlassianAccountId)));
          const hasRequiredPermissions = await service.hasPermissions(accountId, [ {
            projects: [ Number(project.id) ],
            permissions: Array.isArray(requiredPermissions) ? requiredPermissions : [ requiredPermissions ]
          }]).catch(() => false)
          setPermitted(hasRequiredPermissions);
          setProject(project);
        } else {
          setPermitted(true);
          setProject(project);
        }
      }).catch(setErrors).finally(() => setLoading(false));
    }
  }, [ AP, service ]);

  return loading && loadingMessage ? loadingMessage : children({ project, permitted, loading, errors });
}