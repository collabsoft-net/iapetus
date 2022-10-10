import '@collabsoft-net/functions';

import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { Strategy, StrategyOptions } from 'passport-jwt';

@injectable()
export abstract class AbstractJWTStrategy<T, X extends Session> implements IStrategy {

  get name(): string {
    return 'jwt';
  }

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  protected abstract get strategyOptions(): StrategyOptions

  get strategy(): passport.Strategy {
    const _name = this.name;
    return new (class JWTStrategy extends Strategy {
      name = _name;
    })(this.strategyOptions, async (request: express.Request, token: T, done: (err: Error|null, session?: X) => void) => {
      try {
        const session = await this.process(token, request);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

  protected abstract process(token: T, request: express.Request): Promise<X>;

  next(_req: express.Request, _res: express.Response, next: express.NextFunction): void {
    next();
  }

}
