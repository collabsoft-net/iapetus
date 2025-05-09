
import { ACInstance } from '@collabsoft-net/entities';
import { Modes } from '@collabsoft-net/enums';

export {};

declare global {


  interface Session extends Record<string, unknown> {
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