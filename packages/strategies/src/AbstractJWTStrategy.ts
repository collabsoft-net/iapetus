import '@collabsoft-net/functions';

import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { Strategy, StrategyOptions } from 'passport-jwt';

@injectable()
export abstract class AbstractJWTStrategy<T> implements IStrategy {

  get name(): string {
    return 'jwt';
  }

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  protected abstract get strategyOptions(): StrategyOptions

  get strategy(): passport.Strategy {
    return new Strategy(this.strategyOptions, async (token: T, done: (err: Error|null, session?: Session) => void) => {
      try {
        const session = await this.process(token);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

  protected abstract process(token: T): Promise<Session>;

  next(_req: express.Request, _res: express.Response, next: express.NextFunction): void {
    next();
  }

}
