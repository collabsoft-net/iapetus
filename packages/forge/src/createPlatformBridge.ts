import { ClientService, PlatformBridge } from '@collabsoft-net/types';
import { getMacroDataProps } from "./getMacroDataProps";
import { Applications, Modes } from '@collabsoft-net/enums';
import { BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { ForgeRestClient } from './ForgeRestClient';
import { createPlaceholder } from './createPlaceholder';
import { view } from '@forge/bridge';

type TCreatePlatformBridge = <T extends Applications> (product: T) => Promise<PlatformBridge<T>>;

export const createPlatformBridge: TCreatePlatformBridge = async <T extends Applications> (product: T) => ({
  
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