import { isOfType } from '@collabsoft-net/helpers';
import { ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { useContext } from 'react'

import { ConfluenceClientService as ConfluenceClientServiceCtx, JiraClientService as JiraClientServiceCtx } from '../Contexts'
import { AP as APContext } from '../Contexts';

export const useHostService = (): JiraClientService|ConfluenceClientService => {
  const AP = useContext(APContext);
  const jiraService = useContext(JiraClientServiceCtx);
  const confluenceService = useContext(ConfluenceClientServiceCtx);

  if (AP && isOfType(AP, 'jira')) {
    if (!jiraService) {
      throw new Error('Failed to retrieve host service, JiraClientService context is missing');
    }
    return jiraService;
  } else if (AP && isOfType(AP, 'confluence')) {
    if (!confluenceService) {
      throw new Error('Failed to retrieve host service, ConfluenceClientService context is missing');
    }
    return confluenceService;
  }

  throw new Error('Failed to retrieve host service, hook is executed outside of context of Atlassian host product');
}