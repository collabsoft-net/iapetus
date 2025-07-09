import { APRestClient } from '@collabsoft-net/clients';
import { Applications, Modes } from '@collabsoft-net/enums';
import { BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { waitForAP, getMacroDataProps, createPlaceholder } from '@collabsoft-net/connect';
import { CreatePlatformBridge } from '../CreatePlatformBridge';
import { ClientService } from '../ClientService';

export const createPlatformBridge: CreatePlatformBridge = async <T extends Applications> (product: T) => {

  const AP = await waitForAP();

  return {

    init: {
      createPlaceholder: createPlaceholder
    },

    theming: {
      enable: async () => AP.theming.initializeTheming()
    },

    macro: {
      getProperties: getMacroDataProps
    },

    client: (product === 'jira'
      ? new JiraClientService(new APRestClient(AP), Modes.CONNECT)
      : product === 'confluence'
        ? new ConfluenceClientService(new APRestClient(AP), Modes.FORGE)
        : new BitbucketClientService(new APRestClient(AP), Modes.FORGE)
    ) as ClientService<T>

  }
};