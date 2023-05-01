import { useContext, useEffect,useState } from 'react';

import { APProvider } from '../../Contexts/APProvider';
import { JiraClientServiceProvider } from '../../Contexts/JiraClientServiceProvider';

interface JiraProjectProviderProps {
  projectIdOrKey: string|number|PromiseLike<string|number>;
  requiredPermissions?: string|Array<string>;
  loadingMessage?: JSX.Element;
  cacheDuration?: number;
  children: (args: {
    project?: Jira.Project;
    permitted?: boolean;
    errors?: Error;
    loading: boolean;
  }) => JSX.Element;
}

export const JiraProjectProvider = ({ projectIdOrKey, requiredPermissions, loadingMessage, cacheDuration, children }: JiraProjectProviderProps): JSX.Element => {

  const AP = useContext(APProvider);
  const provider = useContext(JiraClientServiceProvider);

  const [ project, setProject ] = useState<Jira.Project>();
  const [ permitted, setPermitted ] = useState<boolean>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    Promise.all([ AP, provider ]).then(async ([ AP, instance ]) => {
      if (instance) {
        const jiraClientService = cacheDuration ? instance.cached(cacheDuration) : instance;
        const idOrKey = await new Promise<string|number>(resolve => resolve(projectIdOrKey));
        const project = await jiraClientService.getProject(idOrKey);
        if (requiredPermissions) {
          const accountId = await new Promise<string>(resolve => AP.user.getCurrentUser(({ atlassianAccountId }) => resolve(atlassianAccountId)));
          const hasRequiredPermissions = await jiraClientService.hasPermissions(accountId, [ {
            projects: [ Number(project.id) ],
            permissions: Array.isArray(requiredPermissions) ? requiredPermissions : [ requiredPermissions ]
          }]).catch(() => false)
          setPermitted(hasRequiredPermissions);
          setProject(project);
        } else {
          setPermitted(true);
          setProject(project);
        }
      } else {
        setErrors(new Error(`Could not find instance of JiraClientService, please make sure to bind it in your Inversify configuration using "JiraClientService.getIdentifier()"`));
      }
    }).catch(setErrors).finally(() => setLoading(false));
  }, [ AP, provider ])

  return loading && loadingMessage ? loadingMessage : children({ project, permitted, loading, errors });
}