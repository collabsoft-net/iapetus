import '@collabsoft-net/functions';

import { SupportedPermissions } from '@collabsoft-net/enums';

export const checkPermissions = async (user: Express.User, projectId?: string, ...requiredPermissions: SupportedPermissions[]): Promise<boolean> => {
  const { uid, oauthClientId, sharedSecret, productType } = user as Session;
  const impersonatedService = user.atlasService.as(uid, oauthClientId, sharedSecret);
  let hasAllRequiredPermissions = false;
  if (productType === 'jira') {
    hasAllRequiredPermissions = await impersonatedService.hasPermissions(requiredPermissions, projectId);
  } else {
    hasAllRequiredPermissions = await requiredPermissions.reduce(async (previous, permission) => {
      const value = await previous;
      if (!value) return value;

      switch (permission) {
        case SupportedPermissions.ADMINISTER:
          return await impersonatedService.memberOf('administrators');
        case SupportedPermissions.SYSTEM_ADMIN:
          return await impersonatedService.memberOf('system-administrators');
        default:
          return true;
      }
    }, Promise.resolve(true));
  }

  return hasAllRequiredPermissions;
}