import '@collabsoft-net/functions';

import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { Strategy, StrategyOptions } from 'passport-jwt';

import { AbstractStrategy } from './AbstractStrategy';

@injectable()
export abstract class AbstractJWTStrategy<T, X extends Session> extends AbstractStrategy<T, X> implements IStrategy {

  get name(): string {
    return 'jwt';
  }

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  protected abstract get strategyOptions(): StrategyOptions

  get strategy(): passport.Strategy {
    const _name = this.name;
    const _options = { ...this.strategyOptions, passReqToCallback: true };

    return new (class JWTStrategy extends Strategy {
      name = _name;
    })(_options, async (request: express.Request, token: T, done: (err: Error|null, session?: X) => void) => {
      try {
        const session = await this.process(request, token);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

}
