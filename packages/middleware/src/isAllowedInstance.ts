
import { isProduction } from '@collabsoft-net/helpers';
import * as express from 'express';
import { warn } from 'firebase-functions/lib/logger';

import { allowedInstances as defaultAllowedInstances } from './allowedInstances';

export const isAllowedInstance = (productionProjectId: string, allowedInstances: Array<string> = defaultAllowedInstances) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (!isProduction() || !process.env.FB_PROJECTID || process.env.FB_PROJECTID !== productionProjectId) {
      const { body } = req;
      if (body && body.baseUrl) {
        if (!allowedInstances.some(instance => body.baseUrl.startsWith(instance))) {
          warn(`A non-production version is not allowed to be installed on instance ${body.baseUrl}`);
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
