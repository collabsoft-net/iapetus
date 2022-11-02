import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import { JiraClientService } from '@collabsoft-net/services';
import { ReactNode, useEffect, useState } from 'react';

interface JiraProjectProviderProps {
  projectIdOrKey: string|number;
  permissions?: Array<Jira.BulkProjectPermissions>;
  children: (args: {
    project?: Jira.Project;
    permitted?: boolean;
  }) => ReactNode;
}

export const JiraProjectProvider = ({ projectIdOrKey, permissions, children }: JiraProjectProviderProps): ReactNode => {
  const [ AP ] = useState<AP.Instance>(kernel.get<AP.Instance>(ServiceIdentifier.AP));
  const [ service ] = useState(kernel.get<JiraClientService>(JiraClientService.getIdentifier()));
  const [ project, setProject ] = useState<Jira.Project>();
  const [ permitted, setPermitted ] = useState<boolean>();

  useEffect(() => {
    if (AP && service) {
      AP.user.getCurrentUser(({ atlassianAccountId }) => {
        Promise.all([
          service.getProject(projectIdOrKey),
          permissions ? service.hasPermissions(atlassianAccountId, permissions) : Promise.resolve(true)
        ]).then(([ project, permitted ]) => {
          setProject(project);
          setPermitted(permitted);
        });
      });
    }
  }, [ AP, service ]);

  return children({ project, permitted });
}