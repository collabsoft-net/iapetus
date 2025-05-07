import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { Strategy, StrategyOptions, StrategyOptionsWithRequest } from 'passport-jwt';

import { AbstractStrategy } from './AbstractStrategy';

@injectable()
export abstract class AbstractJWTStrategy<T extends ACInstance, X extends ACInstanceDTO, Y, Z extends Session> extends AbstractStrategy<T, X, Y, Z> implements IStrategy {

  get name(): string {
    return 'jwt';
  }

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  protected abstract get strategyOptions(): StrategyOptions

  get strategy(): passport.Strategy {
    const _name = this.name;
    const _options: StrategyOptionsWithRequest = { ...this.strategyOptions, passReqToCallback: true };

    return new (class JWTStrategy extends Strategy {
      name = _name;
    })(_options, async (request: express.Request, token: Y, done: (err: Error|null, session?: Z) => void) => {
      try {
        const session = await this.process(request, token);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

}
