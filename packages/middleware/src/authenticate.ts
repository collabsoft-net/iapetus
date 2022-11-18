import * as express from 'express';
import passport from 'passport';

export const authenticate = (authenticators: string | Array<string>, updateLastActive = true) => (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  req.headers = req.headers || {};
  req.headers['X-Collabsoft-UpdateLastActive'] = updateLastActive ? 'true' : 'false';
  passport.authenticate(authenticators, { session: false })(req, res, next);
};