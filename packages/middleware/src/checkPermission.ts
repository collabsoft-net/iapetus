import '@collabsoft-net/functions';

import { SupportedPermissions } from '@collabsoft-net/enums';

export const checkPermissions = async (user: Express.User, projectId?: string, ...requiredPermissions: SupportedPermissions[]): Promise<boolean> => {
  let hasAllRequiredPermissions = false;
  const { uid, oauthClientId, sharedSecret, productType } = user as Session;
  if (uid && typeof uid === 'string' && oauthClientId && typeof oauthClientId === 'string' && sharedSecret && typeof sharedSecret === 'string') {
    const impersonatedService = user.atlasService.as(uid, oauthClientId, sharedSecret);
    if (productType === 'jira') {
      hasAllRequiredPermissions = await impersonatedService.hasPermissions(requiredPermissions, projectId);
    } else if (productType === 'confluence') {
      hasAllRequiredPermissions = await requiredPermissions.reduce(async (previous, permission) => {
        try {
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
        } catch (error) {
          return false;
        }
      }, Promise.resolve(true));
    }
  }

  return hasAllRequiredPermissions;
}