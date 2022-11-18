import '@collabsoft-net/functions';

import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { Strategy } from 'passport-custom';

import { AbstractStrategy } from './AbstractStrategy';

@injectable()
export abstract class AbstractCustomStrategy<X extends Session> extends AbstractStrategy<null, X> implements IStrategy {

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
    })(async (request: express.Request, done: (err: Error|null, session?: X) => void) => {
      try {
        const session = await this.process(request);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

}
