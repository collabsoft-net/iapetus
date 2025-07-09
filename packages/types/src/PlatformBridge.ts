import { Applications, Modes } from '@collabsoft-net/enums';
import { BitbucketClientService,ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';

import { Props } from './Props';

export type ClientService<T extends Applications> = T extends Applications.JIRA
  ? JiraClientService<Modes>
  : T extends Applications.CONFLUENCE
    ? ConfluenceClientService<Modes>
    : BitbucketClientService<Modes>;

export interface PlatformBridge<T extends Applications> {

  init: {
    createPlaceholder: () => Promise<HTMLDivElement|null>;
  };

  theming: {
    enable: () => Promise<void>;
  };

  client: ClientService<T>;

  macro: {
    getProperties: () => Promise<Props|undefined>;
  };

}