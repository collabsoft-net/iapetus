import { Applications, Modes } from '@collabsoft-net/enums';
import { BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { createPlaceholder, ForgeRestClient, getMacroDataProps } from '@collabsoft-net/forge';
import { view } from '@forge/bridge';
import { CreatePlatformBridge } from '../CreatePlatformBridge';
import { ClientService } from '../ClientService';

export const createPlatformBridge: CreatePlatformBridge = async <T extends Applications> (product: T) => ({
  
  init: {
    createPlaceholder: createPlaceholder
  },

  theming: {
    enable: () => view.theme.enable()
  },

  macro: {
    getProperties: getMacroDataProps
  },

  client: (product === 'jira' 
    ? new JiraClientService(new ForgeRestClient(product), Modes.FORGE)
    : product === 'confluence'
      ? new ConfluenceClientService(new ForgeRestClient(product), Modes.FORGE)
      : new BitbucketClientService(new ForgeRestClient(product), Modes.FORGE)
  ) as ClientService<T>

});