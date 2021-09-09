import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { Strategy as IStrategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';
import { Strategy } from 'passport-http-bearer';

@injectable()
export abstract class AbstractBearerStrategy implements IStrategy {

  get name(): string {
    return 'bearer';
  }

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  protected abstract get service(): AbstractService<ACInstance, ACInstanceDTO>;

  get strategy(): passport.Strategy {
    return new Strategy(async (token: string, done: (err: Error|null, session?: Session) => void) => {
      try {
        const session = await this.process(token);
        done(null, session);
      } catch (error) {
        done(error as Error);
      }
    });
  }

  protected abstract process(token: string): Promise<Session>;

  next(_req: express.Request, _res: express.Response, next: express.NextFunction): void {
    next();
  }

}
