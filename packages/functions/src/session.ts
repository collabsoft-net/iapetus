
import { ACInstance } from '@collabsoft-net/entities';
import { Modes } from '@collabsoft-net/enums';

export {};

declare global {

  type Session = Record<string, unknown>

  interface ForgeSession extends Session {
    instance: Atlassian.FIT;
    appToken?: string;
    userToken?: string;
  }

  interface ConnectSession extends Session {
    accountId: string;
    instance: ACInstance;
    mode: Modes;
  }

  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
    /* eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type */
    interface User extends Session {}
  }

}