import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { IStrategyOptions, Strategy } from 'passport-http-bearer';

import { AbstractStrategy } from './AbstractStrategy';

@injectable()
export abstract class AbstractBearerStrategy<X extends Session> extends AbstractStrategy<string, X> implements IStrategy {

  get name(): string {
    return 'bearer';
  }

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  protected abstract get service(): AbstractService<ACInstance, ACInstanceDTO>;
  protected abstract get strategyOptions(): IStrategyOptions;

  get strategy(): passport.Strategy {
    const _name = this.name;
    const _options = { ...this.strategyOptions, passReqToCallback: true };

    return new (class BearerStrategy extends Strategy {
      name = _name;
    })(_options, async (request: express.Request, token: string, done: (err: Error|null, session?: X) => void) => {
      try {
        const session = await this.process(request, token);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

}
