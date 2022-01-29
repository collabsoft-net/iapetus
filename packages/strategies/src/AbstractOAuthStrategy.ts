
import { Strategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';

@injectable()
export abstract class AbstractOAuthStrategy<T> implements Strategy {

  abstract get name(): string;

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  abstract get strategy(): passport.Strategy;

  protected callback() {
    return async (req: express.Request, accessToken: string, refreshToken: string, profile: T, done: (err: Error|null, profile?: unknown) => void): Promise<void> => {
      try {
        const state = typeof req.query['state'] === 'string' ? req.query['state'] : undefined;
        const user = await this.process(accessToken, refreshToken, profile, state);
        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    };
  }

  abstract process(accessToken: string, refreshToken: string, profile: T, state?: string): Promise<T>;

  next(_req: express.Request, res: express.Response): void {
    res.redirect(`/`);
  }

}