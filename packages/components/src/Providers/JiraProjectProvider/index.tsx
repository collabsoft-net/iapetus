import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import { JiraClientService } from '@collabsoft-net/services';
import { ReactNode, useEffect, useState } from 'react';

interface JiraProjectProviderProps {
  projectIdOrKey: string|number;
  requiredPermissions?: Array<Jira.BulkProjectPermissions>;
  loadingMessage?: ReactNode;
  children: (args: {
    project?: Jira.Project;
    permitted?: boolean;
    errors?: Error;
    loading: boolean;
  }) => ReactNode;
}

export const JiraProjectProvider = ({ projectIdOrKey, requiredPermissions, loadingMessage, children }: JiraProjectProviderProps): ReactNode => {
  const [ AP ] = useState<AP.Instance>(kernel.get<AP.Instance>(ServiceIdentifier.AP));
  const [ service ] = useState(kernel.get<JiraClientService>(JiraClientService.getIdentifier()));
  const [ project, setProject ] = useState<Jira.Project>();
  const [ permitted, setPermitted ] = useState<boolean>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    if (AP && service) {
      if (requiredPermissions) {
        AP.user.getCurrentUser(({ atlassianAccountId }) => Promise.all([
          service.hasPermissions(atlassianAccountId, requiredPermissions).catch(() => false),
          service.getProject(projectIdOrKey).catch((err: Error) => { setErrors(err); return undefined })
        ]).then(([ permitted, project ]) => {
          setProject(project);
          setPermitted(permitted);
        }).finally(() => setLoading(false)));
      } else {
        service.getProject(projectIdOrKey).then(project => {
          setProject(project);
          setPermitted(true);
        }).finally(() => setLoading(false));
      }
    }
  }, [ AP, service ]);

    return loading && loadingMessage ? loadingMessage : children({ project, permitted, loading, errors });
}