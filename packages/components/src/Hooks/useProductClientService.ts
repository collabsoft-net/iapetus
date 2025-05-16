import { Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { BambooClientService, BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';

import {
  BambooClientService as BambooClientServiceCtx,
  BitbucketClientService as BitbucketClientServiceCtx,
  ConfluenceClientService as ConfluenceClientServiceCtx,
  JiraClientService as JiraClientServiceCtx
} from '../Contexts'
import { useACJS } from './useACJS';
import { useContext } from './useContext';

export const useProductClientService = <T extends JiraClientService<Modes>|ConfluenceClientService<Modes>|BambooClientService|BitbucketClientService<Modes>> (): T  => {
  const ACJS = useACJS();

  return (
    isOfType<AP.JiraInstance>(ACJS, 'jira')
      ? useContext(JiraClientServiceCtx, JiraClientService.getIdentifier()) as T
      : isOfType<AP.ConfluenceInstance>(ACJS, 'confluence')
        ? useContext(ConfluenceClientServiceCtx, ConfluenceClientService.getIdentifier()) as T
        : isOfType<AP.BambooInstance>(ACJS, 'bamboo')
          ? useContext(BambooClientServiceCtx, BambooClientService.getIdentifier()) as T
          : useContext(BitbucketClientServiceCtx, BitbucketClientService.getIdentifier()) as T
  );
}