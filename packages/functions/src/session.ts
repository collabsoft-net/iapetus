
import { AbstractAtlasClientService } from '@collabsoft-net/services';

export {};

declare global {

  /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
  interface Session extends Record<string, unknown> {
    atlasService: AbstractAtlasClientService;
  }

  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
  /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
    interface User extends Session {}
  }
}