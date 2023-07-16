import { useContext, useEffect,useState } from 'react';
import { useJiraUser } from 'src/Hooks';

import { AP as APContext } from '../../Contexts/AP';
import { JiraClientService } from '../../Contexts/JiraClientService';

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

  const AP = useContext(APContext);
  const jiraClientService = useContext(JiraClientService);
  const [ user ] = useJiraUser();

  const [ project, setProject ] = useState<Jira.Project>();
  const [ permitted, setPermitted ] = useState<boolean>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    if (!AP) {
      setErrors(new Error(`Failed to retrieve instance of AP, please make sure the AP context is inititalized`));
      setLoading(false);
    } else if (!jiraClientService) {
      setErrors(new Error(`Failed to retrieve instance of JiraClientService, please make sure the JiraClientService context is inititalized`));
      setLoading(false);
    } else if (user) {
      const service = cacheDuration ? jiraClientService.cached(cacheDuration) : jiraClientService;
      new Promise<string|number>(resolve => resolve(projectIdOrKey))
        .then(idOrKey => service.getProject(idOrKey))
        .then(project => {
          setProject(project);
          if (requiredPermissions) {
            return service.hasPermissions(user.accountId, [ {
              projects: [ Number(project.id) ],
              permissions: Array.isArray(requiredPermissions) ? requiredPermissions : [ requiredPermissions ]
            }]).then(setPermitted).catch(() => setPermitted(false));
          } else {
            setPermitted(true);
          }
          return;
        }).catch(setErrors).finally(() => setLoading(false));
    }
  }, [ user ])

  return loading && loadingMessage ? loadingMessage : children({ project, permitted, loading, errors });
}