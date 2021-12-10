
import { isProduction } from '@collabsoft-net/helpers';
import { Strategy as IStrategy } from '@collabsoft-net/types';
import { captureException, Handlers as Sentry } from '@sentry/node';
import cookies from 'cookie-parser';
import * as express from 'express';
import { https } from 'firebase-functions';
import { error, info } from 'firebase-functions/lib/logger';
import * as inversify from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import passport from 'passport';

export const Strategy = Symbol.for('Strategies');

export const createAppServer = (container: inversify.interfaces.Container | (() => inversify.interfaces.Container), configure?: (app: Express.Application) => void): (req: https.Request, resp: express.Response) => void | Promise<void> => {
  const appContainer = typeof container === 'function' ? container() : container;
  const strategies = appContainer.isBound(Strategy) ? appContainer.getAll<IStrategy>(Strategy) : [];

  return new InversifyExpressServer(appContainer).setConfig((app) => {
    try {
      app.set('trust proxy', 1);
      app.disable('x-powered-by');
      app.use(cookies());

      app.use(Sentry.requestHandler());
      app.use(Sentry.errorHandler());

      // Disable caching for the API as all these endpoints are about authentication
      app.use((_req, res, next) => {
        res.setHeader('Cache-Control', 'private');
        next();
      });

      app.use(passport.initialize());

      strategies.forEach((instance) => {
        passport.use(instance.strategy)
        !isProduction && info(`Registering strategy [${instance.name}]`);
        app.get(`/api/${instance.name.toLowerCase()}/auth`, (req, res, next) => {
          const options = instance.options;
          options.state = req.query ? Buffer.from(JSON.stringify(req.query)).toString('base64') : undefined;
          const authenticator = passport.authenticate(instance.name.toLowerCase(), options);
          authenticator(req, res, next);
        });
        app.get(`/api/${instance.name.toLowerCase()}/callback`, passport.authenticate(instance.name.toLowerCase(), { session: false, failureRedirect: '/' }), (req, res, next) => {
          instance.next(req, res, next);
        });
      });

      if (configure) {
        configure(app);
      }
    } catch (exp) {
      captureException(exp);
      error('Server error', { error: JSON.stringify(exp) });
    }
  }).build();
}