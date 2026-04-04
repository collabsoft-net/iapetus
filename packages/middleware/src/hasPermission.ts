import { ConfluenceRestClient, JiraRestClient } from '@collabsoft-net/clients';
import { ACInstance, ForgeInstance } from '@collabsoft-net/entities';
import { isOfType } from '@collabsoft-net/helpers';
import { ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import * as express from 'express';
import { logger } from 'firebase-functions';

export const hasGlobalPermissions = (...permissions: Array<string|Confluence.ContentOperation>): express.Handler => {
  return async (req: Express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { user } = req;
      let hasAllRequiredPermissions = false;

      if (user && isOfType<AtlasSession>(user, 'instance')) {
        const { accountId, instance, appSystemToken, mode } = user;
        if (instance.productType === 'jira') {
          const service = isOfType<ForgeInstance>(instance, 'installationId')
            ? new JiraClientService(new JiraRestClient(instance, appSystemToken), mode)
            : new JiraClientService(new JiraRestClient(instance), mode);
          hasAllRequiredPermissions = await service.hasPermissions(accountId, undefined, permissions);
        } else if (instance.productType === 'confluence') {
          const service = isOfType<ForgeInstance>(instance, 'installationId')
            ? new ConfluenceClientService(new ConfluenceRestClient(instance, appSystemToken), mode)
            : new ConfluenceClientService(new ConfluenceRestClient(instance), mode);
          hasAllRequiredPermissions = await permissions.reduce(async (previous, permission) => {
            const hasPermission = await previous;
            if (!hasPermission) return hasPermission;
            return service.hasApplicationPermission(accountId, permission as Confluence.ContentOperation);
          }, Promise.resolve(true));
        }
      }

      if (hasAllRequiredPermissions) {
        next();
      } else {
        res.status(403).send('Unauthorized!');
      }
    } catch (error) {
      logger.warn(`Failed to authenticate user for global permissions '${permissions.join(', ')}'`, error);
      res.status(403).send('Unauthorized!');
    }
  }
}

export const hasEntityPermission = (entityType: 'project'|'issue'|'content'|'space', permission: Array<string>|Confluence.ContentOperation, paramName = 'entityId'): express.Handler => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { user, query, params } = req;
      let hasAllRequiredPermissions = false;

      if (user && isOfType<AtlasSession>(user, 'instance')) {
        const { accountId, instance, mode } = user;
        const entityId = (user as Session)[paramName] || query[paramName] || params[paramName];
        if (entityId && typeof entityId === 'string') {
          if (instance.productType === 'jira') {
            // This is a bit weird, but we need to tell Typescript which type it is
            const service = isOfType<ACInstance>(instance, 'key')
              ? new JiraClientService(new JiraRestClient(instance), mode)
              : new JiraClientService(new JiraRestClient(instance), mode);
            const permissions: Jira.BulkProjectPermissions = {
              projects: entityType === 'project' ? [ Number(entityId) ] : undefined,
              issues: entityType === 'issue' ? [ Number(entityId) ] : undefined,
              permissions: Array.isArray(permission) ? permission : []
            };
            hasAllRequiredPermissions = await service.hasPermissions(accountId, [ permissions ]);
          } else if (instance.productType === 'confluence' && !Array.isArray(permission)) {
            // This is a bit weird, but we need to tell Typescript which type it is
            const service = isOfType<ACInstance>(instance, 'key')
              ? new ConfluenceClientService(new ConfluenceRestClient(instance), mode)
              : new ConfluenceClientService(new ConfluenceRestClient(instance), mode);
            if (entityType === 'content') {
              hasAllRequiredPermissions = await service.hasContentPermission(entityId, {
                type: 'user',
                identifier: accountId
              }, permission);
            } else if (entityType === 'space') {
              hasAllRequiredPermissions = await service.hasSpacePermission(entityId, permission, accountId);
            }
          }
        }
      }

      if (hasAllRequiredPermissions) {
        next();
      } else {
        res.status(403).send('Unauthorized!');
      }
    } catch (error) {
      logger.warn(`Failed to authenticate user for entity '${entityType}' permissions '${Array.isArray(permission) ? permission.join(', ') : permission}'`, error);
      res.status(403).send('Unauthorized!');
    }
  }
}
