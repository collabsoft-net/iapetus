import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { IStrategyOptions, Strategy, VerifyFunctions } from 'passport-http-bearer';

import { AbstractStrategy } from './AbstractStrategy';

@injectable()
export abstract class AbstractBearerStrategy<T extends ACInstance, X extends ACInstanceDTO, Y extends Session> extends AbstractStrategy<T, X, string, Y> implements IStrategy {

  get name(): string {
    return 'bearer';
  }

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  protected abstract get service(): AbstractService<T, X>;
  protected abstract get strategyOptions(): IStrategyOptions;

  get strategy(): passport.Strategy {
    const _name = this.name;
    const _options = { ...this.strategyOptions, passReqToCallback: true };

    return new (class BearerStrategy<Z extends VerifyFunctions> extends Strategy<Z> {
      name = _name;
    })(_options, async (request: express.Request, token: string, done: (err: Error|null, session?: Y) => void) => {
      try {
        const session = await this.process(request, token);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

}
