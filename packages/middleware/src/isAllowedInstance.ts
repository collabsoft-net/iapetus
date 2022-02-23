
import { isNullOrEmpty, isOfType, isProduction } from '@collabsoft-net/helpers';
import * as express from 'express';
import { warn } from 'firebase-functions/lib/logger';

import { allowedInstances as defaultAllowedInstances } from './allowedInstances';

const getBaseURL = (req: express.Request): string|null => {
  const { body, user } = req;
  if (body && body.baseUrl) {
    return body.baseUrl;
  } else if (isOfType<Session>(user, 'instance')) {
    return user.instance.baseUrl;
  }
  return null;
}

export const isAllowedInstance = (productionProjectId: string, allowedInstances: Array<string> = defaultAllowedInstances) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (!isProduction() || !process.env.FB_PROJECTID || process.env.FB_PROJECTID !== productionProjectId) {
      const baseUrl = getBaseURL(req);
      if (!isNullOrEmpty(baseUrl)) {
        if (!allowedInstances.some(instance => (baseUrl as string).startsWith(instance))) {
          warn(`A non-production version is not allowed to use this endpoint (${baseUrl})`);
          res.status(401).send('Forbidden');
        } else {
          next();
        }
      } else {
        res.status(400).send('Bad request');
      }
    } else {
      next();
    }
  }
}

