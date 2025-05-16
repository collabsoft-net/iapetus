import { Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { BambooClientService, BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';

import {
  BambooClientService as BambooClientServiceCtx,
  BitbucketClientService as BitbucketClientServiceCtx,
  ConfluenceClientService as ConfluenceClientServiceCtx,
  JiraClientService as JiraClientServiceCtx} from '../Contexts'
import { useACJS } from './useACJS';
import { useContext } from './useContext';

export const useProductClientService = <T extends JiraClientService<Modes>|ConfluenceClientService<Modes>|BambooClientService|BitbucketClientService<Modes>> (): T  => {
  const ACJS = useACJS();
  const jiraService = useContext(JiraClientServiceCtx, JiraClientService.getIdentifier());
  const confluenceService = useContext(ConfluenceClientServiceCtx, ConfluenceClientService.getIdentifier());
  const bambooService = useContext(BambooClientServiceCtx, ConfluenceClientService.getIdentifier());
  const bitbucketService = useContext(BitbucketClientServiceCtx, ConfluenceClientService.getIdentifier());

  if (ACJS && isOfType(ACJS, 'jira')) {
    if (!jiraService) {
      throw new Error('Failed to retrieve product client service, JiraClientService context is missing');
    }
    return jiraService as T;
  } else if (ACJS && isOfType(ACJS, 'confluence')) {
    if (!confluenceService) {
      throw new Error('Failed to retrieve product client service, ConfluenceClientService context is missing');
    }
    return confluenceService as T;
  } else if (ACJS && isOfType(ACJS, 'bamboo')) {
    if (!bambooService) {
      throw new Error('Failed to retrieve product client service, BambooClientService context is missing');
    }
    return bambooService as T;
  } else if (ACJS && isOfType(ACJS, 'bitbucket')) {
    if (!bitbucketService) {
      throw new Error('Failed to retrieve product client service, BitbucketClientService context is missing');
    }
    return bitbucketService as T;
  }

  throw new Error('Failed to retrieve product client service, hook is executed outside of context of supported Atlassian host product');
}