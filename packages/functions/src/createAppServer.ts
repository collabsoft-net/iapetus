
import { isProduction } from '@collabsoft-net/helpers';
import { Strategy as IStrategy } from '@collabsoft-net/types';
import { captureException, setupExpressErrorHandler } from '@sentry/node';
import cookies from 'cookie-parser';
import type { Application } from 'express';
import { logger } from 'firebase-functions';
import { HttpsFunction, HttpsOptions, onRequest } from 'firebase-functions/v2/https';
import { StatusCodes } from 'http-status-codes';
import * as inversify from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import passport from 'passport';

export const Strategy = Symbol.for('Strategies');

type AppServerOptions = {
  name: string;
  container: inversify.Container | (() => inversify.Container)
  functionOptions?: HttpsOptions;
  baseUrl: string;
}

export const createAppServer = (options: AppServerOptions, configure?: (app: Application) => void): void|Record<string, HttpsFunction> => {
  const { name, container, functionOptions, baseUrl } = options;

  const urlPrefix = baseUrl.endsWith('/') ? baseUrl : '/';
  const appContainer = typeof container === 'function' ? container() : container;
  const strategies = appContainer.isBound(Strategy) ? appContainer.getAll<IStrategy>(Strategy) : [];

  const instance = new InversifyExpressServer(appContainer).setConfig((app) => {
    try {
      if (configure) {
        configure(app);
      }

      app.set('trust proxy', 1);
      app.disable('x-powered-by');
      app.use(cookies());

      // Disable caching for the API as all these endpoints are about authentication
      app.use((_req, res, next) => {
        res.setHeader('strict-transport-security', 'max-age=31556926');
        res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate,max-age=0');
        next();
      });

      // Add global healtcheck endpoint to all apps
      app.get(`${urlPrefix}healthcheck`, (_req, res) => {
        res.sendStatus(StatusCodes.OK);
      });

      app.use(passport.initialize());

      strategies.forEach((instance) => {
        passport.use(instance.strategy)
        if (!isProduction()) {
          logger.info(`Registering strategy [${instance.name}]`);
        }
        app.get(`${urlPrefix}${instance.name.toLowerCase()}/auth`, (req, res, next) => {
          const options = instance.options;
          options.state = req.query ? Buffer.from(JSON.stringify(req.query)).toString('base64') : undefined;
          const authenticator = passport.authenticate(instance.name.toLowerCase(), options);
          authenticator(req, res, next);
        });
        app.get(`${urlPrefix}${instance.name.toLowerCase()}/callback`, passport.authenticate(instance.name.toLowerCase(), { session: false, failureRedirect: '/' }), (req, res, next) => {
          instance.next(req, res, next);
        });
      });

      setupExpressErrorHandler(app);
    } catch (exp) {
      captureException(exp);
      logger.error('Server error', { error: JSON.stringify(exp) });
    }
  }).build();

  return {
    [name]: onRequest(functionOptions || {}, instance)
  }
}