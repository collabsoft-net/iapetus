import * as express from 'express';
import { injectable } from 'inversify';
import { BaseHttpController, interfaces } from 'inversify-express-utils';
import * as passport from 'passport';

export const authenticate = (authenticators: string | Array<string>) => (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  passport.authenticate(authenticators, { session: false })(req, res, next);
};

@injectable()
export class AbstractController extends BaseHttpController implements interfaces.Controller {

  protected get session(): Session {
    return this.httpContext.request.user as Session;
  }

}