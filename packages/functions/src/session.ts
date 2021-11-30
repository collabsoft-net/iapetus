
import { ACInstance } from '@collabsoft-net/entities';
import { Modes } from '@collabsoft-net/enums';
import { AtlasEndpoints } from '@collabsoft-net/types';

export {};

declare global {

  /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
  interface Session extends Record<string, unknown> {
    accountId: string;
    instance: ACInstance;
    atlasEndpoints: AtlasEndpoints;
    mode: Modes;
  }

  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
  /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
    interface User extends Session {}
  }
}