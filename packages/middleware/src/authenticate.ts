import * as express from 'express';
import passport from 'passport';

export const authenticate = (authenticators: string | Array<string>) => (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  passport.authenticate(authenticators, { session: false })(req, res, next);
};