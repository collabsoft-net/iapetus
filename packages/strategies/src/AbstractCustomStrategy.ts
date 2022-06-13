import '@collabsoft-net/functions';

import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { Strategy } from 'passport-custom';

@injectable()
export abstract class AbstractCustomStrategy<T extends Session> implements IStrategy {

  get name(): string {
    return 'custom';
  }

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  get strategy(): passport.Strategy {
    const _name = this.name;
    return new (class CustomStrategy extends Strategy {
      name = _name;
    })(async (request: express.Request, done: (err: Error|null, session?: T) => void) => {
      try {
        const session = await this.process(request);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

  protected abstract process(request: express.Request): Promise<T>;

  next(_req: express.Request, _res: express.Response, next: express.NextFunction): void {
    next();
  }

}
