
import { ConnectInstance, ForgeInstance } from '@collabsoft-net/entities';
import { Modes } from '@collabsoft-net/enums';

export type Session = Record<string, unknown>

export interface AtlasSession extends Session {
    accountId: string;
    instance: ConnectInstance|ForgeInstance;
    appSystemToken?: string;
    appUserToken?: string;
    mode: Modes;
  }

declare global {

  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
    /* eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type */
    interface User extends Session {}
  }

}

export {};
