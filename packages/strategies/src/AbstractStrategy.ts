import '@collabsoft-net/functions';

import * as express from 'express';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractStrategy<T, X extends Session> {

  protected abstract process(request: express.Request): Promise<X>;
  protected abstract process(request: express.Request, token?: T): Promise<X>;

  next(_req: express.Request, _res: express.Response, next: express.NextFunction): void {
    next();
  }

}
