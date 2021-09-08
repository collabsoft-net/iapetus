
import { Strategy } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import * as passport from 'passport';

@injectable()
export abstract class AbstractOAuthStrategy implements Strategy {

  abstract get name(): string;

  get options(): passport.AuthenticateOptions {
    return { session: false };
  }

  abstract get strategy(): passport.Strategy;

  protected callback() {
    return async (_req: express.Request, accessToken: string, refreshToken: string, profile: unknown, done: (err: Error|null, profile?: unknown) => void): Promise<void> => {
      try {
        await this.process(accessToken, refreshToken, profile);
        done(null, profile);
      } catch (error) {
        done(error as Error);
      }
    };
  }

  abstract process(accessToken: string, refreshToken: string, profile: unknown): Promise<void>;

  next(_req: express.Request, res: express.Response): void {
    res.redirect(`/`);
  }

}