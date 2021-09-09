import { SupportedPermissions } from '@collabsoft-net/enums';
import * as express from 'express';

import { checkPermissions } from './checkPermission';

export const hasPermissions = (...requiredPermissions: SupportedPermissions[]): express.Handler => {
  return async (req: Express.Request, res: express.Response, next: express.NextFunction) => {
    const { user } = req;
    if (user) {
      const hasAllRequiredPermissions = await checkPermissions(user, undefined, ...requiredPermissions);
      if (!hasAllRequiredPermissions) {
        res.status(403).send('Unauthorized!');
      } else {
        next();
      }
    } else {
      res.status(403).send('Unauthorized!');
    }
  }
}
