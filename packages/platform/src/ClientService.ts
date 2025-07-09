import type { Applications, Modes } from '@collabsoft-net/enums';
import type { BitbucketClientService,ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';

export type ClientService<T extends Applications> = T extends Applications.JIRA
  ? JiraClientService<Modes>
  : T extends Applications.CONFLUENCE
    ? ConfluenceClientService<Modes>
    : BitbucketClientService<Modes>;
