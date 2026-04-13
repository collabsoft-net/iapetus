import '@collabsoft-net/functions';

import { BitbucketRestClient, ConfluenceRestClient, JiraRestClient } from '@collabsoft-net/clients';
import { ForgeInstanceDTO } from '@collabsoft-net/dto';
import { ForgeInstance } from '@collabsoft-net/entities';
import { Applications, Modes } from '@collabsoft-net/enums';
import { isNullOrEmpty, isOfType } from '@collabsoft-net/helpers';
import { AbstractService, BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { CachingService } from '@collabsoft-net/types';
import { randomBytes, scryptSync } from 'crypto';
import * as express from 'express';
import { injectable } from 'inversify';
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
import uniqid from 'uniqid';

import { AbstractBearerStrategy } from './AbstractBearerStrategy';

@injectable()
export abstract class AbstractForgeInvocationTokenStrategy<T extends AtlasSession> extends AbstractBearerStrategy<T> {

  constructor(private allowAnonymousAccess = false) {
    super();
  }

  protected abstract toConnectKey(token: Atlassian.FIT): Promise<string|undefined>;
  protected abstract toCacheService(token: Atlassian.FIT): Promise<CachingService>;
  protected abstract toForgeInstanceService(token: Atlassian.FIT): Promise<AbstractService<ForgeInstance, ForgeInstanceDTO>>;
  protected abstract toSession(token: Atlassian.FIT, instance?: ForgeInstance|null, appSystemToken?: string, appUserToken?: string): Promise<T>;

  protected async process(request: express.Request, token?: string): Promise<T> {
    if (!token || typeof token !== 'string') throw new Error('Invalid Bearer token');

    // Make sure to check if this is even a valid FIT
    const unverifiedPayload: Atlassian.FIT = decodeJwt(token);
    if (!unverifiedPayload.app?.id) {
      throw new Error('Invalid Bearer token');
    }

    // Make sure that this is not an anonymous user (unless this is explicitly allowed)
    if (!this.allowAnonymousAccess && isNullOrEmpty(unverifiedPayload.principal)) {
      throw new Error('Anonymous access is not allowed');
    }

    // Extract the host product from the FIT
    const baseUrlProductMatch = /^https:\/\/api.atlassian.com\/ex\/(.*)\//.exec(unverifiedPayload.app.apiBaseUrl);
    const product: 'jira'|'confluence'|undefined = baseUrlProductMatch ? baseUrlProductMatch[1] as 'jira'|'confluence' : undefined;
    if (!product || (product !== 'jira' && product !== 'confluence')) throw new Error('Unable to determine host product, which is required for exchanging tokens');

    // Check if the token has expired or not
    const now = Math.round(new Date().getTime() / 1000);
    if (unverifiedPayload && Number(unverifiedPayload.exp) < now) throw new Error('Session expired');

    // Verify the token using the Atlassian public key
    const JWKS = createRemoteJWKSet(new URL('https://forge.cdn.prod.atlassian-dev.net/.well-known/jwks.json'));
    const { payload } = await jwtVerify<Atlassian.FIT>(token, JWKS, {
      audience: unverifiedPayload.app.id,
      issuer: 'forge/invocation-token',
    });

    // Get the Forge OAuth tokens from the headers
    const appSystemToken = request.header('x-forge-oauth-system');
    const appUserToken = request.header('x-forge-oauth-user');

    // Get the instance service associated with this FIT
    const service = await this.toForgeInstanceService(payload);

    // Ok, we are ready to see if we can find a customer instance
    // First, we try to find the instance based on the Forge installation ID
    let instance = await service.findByProperty('installationId', payload.app.installationId);

    // Check if this is an initial installation or if the instance is migrated from Connect
    // Connect apps migrated to forge receive a lifecycle installation event with the installation ID
    // However, they will not yet have the required Forge specific properties so we should update them
    // We use the 'isForge' property to determine if an instance has been migrated succesfully
    if (!instance || !instance.isForge) {

      // Preserve the Cloud ID for migration purposes
      // The cloud ID seems to be shared between environments, so this cannot be used to locate the instance
      const cloudId = isOfType(instance, 'cloudId')
        ? instance.cloudId
        : isOfType(payload.app, 'context')
          ? isOfType(payload.app.context, 'cloudId')
            ? String(payload.app.context.cloudId)
            : undefined
          : undefined;

      // We use Connect lifecycle events to match the clientKey with the installation ID
      // If for some reason the Connect lifecycle event did not fire yet (i.e. because of a delay)
      // and we failed to match the installation based on installation ID and cloud ID
      // we can use this endpoint to retrieve the clientKey
      // see https://developer.atlassian.com/platform/adopting-forge-from-connect/migrate-connect-clientkey/
      const connectKey = await this.toConnectKey(payload);
      if (!instance && appSystemToken && connectKey) {

        const clientService = product === Applications.JIRA
          ? new JiraClientService(new JiraRestClient({ apiBaseUrl: payload.app.apiBaseUrl } as ForgeInstance, appSystemToken), Modes.FORGE)
          : product === Applications.CONFLUENCE
            ? new ConfluenceClientService(new ConfluenceRestClient({ apiBaseUrl: payload.app.apiBaseUrl } as ForgeInstance, appSystemToken), Modes.FORGE)
            : product === Applications.BITBUCKET
              ? new BitbucketClientService(new BitbucketRestClient({ apiBaseUrl: payload.app.apiBaseUrl } as ForgeInstance, appSystemToken), Modes.FORGE)
              : undefined;

        const clientKey = clientService && await clientService.getConnectClientKey(connectKey);
        if (clientKey) {
          instance = await service.findByProperty('clientKey', clientKey);
        }
      }

      // Update the instance to migrate it to forge
      // Preserve the existing property values and only set them if missing
      instance = await service.save({
        ...instance || {},
        id: instance?.id || uniqid(),
        salt: instance?.salt || randomBytes(32).toString('hex'),
        oauthClientId: instance?.oauthClientId || uniqid(),
        installationId: instance?.installationId || payload.app.installation.id,
        cloudId: instance?.cloudId || cloudId,
        apiBaseUrl: instance?.apiBaseUrl || payload.app.apiBaseUrl,
        product: instance?.product || product,
        isForge: true
      });
    }

    // If we cannot find an instance, we should create one
    // At this point we can assume that this is a valid request from a customer
    // We can also assume that this is not a migration from Connect to Forge
    // If we can't find an instance, this means that there is a race condition
    // The customer is making requests before lifecycle events hvae been proceessed
    if (!instance) {
      instance = {
        id: uniqid(),
        salt: randomBytes(32).toString('hex'),
        oauthClientId: uniqid(),
        installationId: payload.app.installation.id,
        cloudId: isOfType(payload.app, 'context') && isOfType(payload.app.context, 'cloudId') && String(payload.app.context.cloudId) || undefined,
        apiBaseUrl: payload.app.apiBaseUrl,
        product,
        isForge: true
      }
    }

    // Store the appToken and userToken in cache (encrypted)
    instance.appSystemTokenKey = undefined;
    instance.appUserTokenKey = undefined;
    const appTokenCacheKey = scryptSync(randomBytes(16).toString('hex'), instance.id, 16).toString('hex');
    const userTokenCacheKey = scryptSync(randomBytes(16).toString('hex'), instance.id, 16).toString('hex');

    // Get the cache service
    const cacheService = await this.toCacheService(payload);

    if (cacheService) {
      const ttl = 15 * 60;
      if (appSystemToken) {
        await cacheService.set(appTokenCacheKey, appSystemToken, ttl, true);
        instance.appSystemTokenKey = appTokenCacheKey;
      }
      if (appUserToken) {
        await cacheService.set(userTokenCacheKey, appUserToken, ttl, true);
        instance.appUserTokenKey = appTokenCacheKey;
      }
    }

    instance = this.updateLastActive(instance, request);
    instance = await service.save(instance);

    return this.toSession(payload, instance, appSystemToken, appUserToken);
  }

  protected updateLastActive(instance: ForgeInstance, { headers }: express.Request): ForgeInstance {
    if (headers && typeof headers['X-Collabsoft-UpdateLastActive'] === 'string' && headers['X-Collabsoft-UpdateLastActive'] === 'true') {
      // Only update the lastActive if non-existant or less than 24 hours ago
      if (!instance.lastActive || instance.lastActive < (new Date().getTime() - (24 * 60 * 60 * 1000))) {
        instance.lastActive = new Date().getTime();
      }
    }
    return instance;
  }

}
