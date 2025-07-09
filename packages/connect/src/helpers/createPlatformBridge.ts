import { APRestClient } from '@collabsoft-net/clients';
import { Applications, Modes } from '@collabsoft-net/enums';
import { BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { ClientService, PlatformBridge } from '@collabsoft-net/types';

import { getMacroDataProps } from './getMacroDataProps';
import { waitForAP } from './waitForAP';

type TCreatePlatformBridge = <T extends Applications> (product: T) => Promise<PlatformBridge<T>>;

export const createPlatformBridge: TCreatePlatformBridge = async <T extends Applications> (product: T) => {

  const AP = await waitForAP();

  return {
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