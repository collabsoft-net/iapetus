import { useContext } from 'react'

import { ConfluenceClientService, JiraClientService } from '../Contexts'
import { AP as APContext } from '../Contexts';

export const useHostService = () => {
  const AP = useContext(APContext);
  const jiraService = useContext(JiraClientService);
  const confluenceService = useContext(ConfluenceClientService);

  if (AP?.jira) {
    return jiraService;
  } else if (AP?.confluence) {
    return confluenceService;
  } else {
    return null;
  }
}