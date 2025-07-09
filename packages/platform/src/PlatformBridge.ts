import type { Applications } from '@collabsoft-net/enums';
import type { Props } from '@collabsoft-net/types';
import { ClientService } from './ClientService';

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