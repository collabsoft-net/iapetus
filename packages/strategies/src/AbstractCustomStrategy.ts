import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { Strategy } from 'passport-custom';

import { AbstractStrategy } from './AbstractStrategy';

@injectable()
export abstract class AbstractCustomStrategy<T extends ACInstance, X extends ACInstanceDTO, Y extends Session> extends AbstractStrategy<T, X, null, Y> implements IStrategy {

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
    })(async (request: express.Request, done: (err: Error|null, session?: Y) => void) => {
      try {
        const session = await this.process(request);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

}
