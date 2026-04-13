import '@collabsoft-net/functions';

import { decodeSymmetric, SymmetricAlgorithm } from '@atlassian/atlassian-jwt';
import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { AbstractService } from '@collabsoft-net/services';
import * as express from 'express';
import { injectable } from 'inversify';

import { AbstractBearerStrategy } from './AbstractBearerStrategy';

@injectable()
export abstract class AbstractAtlassianTokenBearerStrategy<T extends ACInstance, X extends ACInstanceDTO, Y extends AtlasSession> extends AbstractBearerStrategy<Y> {

  constructor(private allowAnonymousAccess = false) {
    super();
  }

  protected abstract toConnectInstanceService(token: Atlassian.JWT): Promise<AbstractService<T, X>>;

  protected async process(request: express.Request, payload?: string): Promise<Y> {
    if (!payload) throw new Error('Invalid Bearer token');

    const unverifiedToken = decodeSymmetric(payload, '', SymmetricAlgorithm.HS256, true) as Atlassian.JWT;

    const { iss, exp } = unverifiedToken;
    if (!iss) throw new Error('Invalid Bearer token');

    const now = Math.round(new Date().getTime() / 1000);
    if (typeof exp === 'number' && exp < now) throw new Error('Session expired');

    if (!this.allowAnonymousAccess && isNullOrEmpty(unverifiedToken.sub)) {
      throw new Error('Anonymous access is not allowed');
    }

    const service = await this.toConnectInstanceService(unverifiedToken);
    let instance = await service.findById(iss) || await service.findByProperty('clientKey', iss);
    if (instance) {
      const verifiedToken = decodeSymmetric(payload, instance.sharedSecret, SymmetricAlgorithm.HS256) as Atlassian.JWT;
      instance = this.updateLastActive(instance, request);
      instance = await service.save(instance);
      return this.toSession(verifiedToken, instance);
    } else {
      throw new Error('Customer instance not found, unable to verify token');
    }
  }

  protected abstract toSession(payload: Atlassian.JWT, instance: T): Promise<Y>;

  protected updateLastActive(instance: T, { headers }: express.Request): T {
    if (headers && typeof headers['X-Collabsoft-UpdateLastActive'] === 'string' && headers['X-Collabsoft-UpdateLastActive'] === 'true') {
      // Only update the lastActive if non-existant or less than 24 hours ago
      if (!instance.lastActive || instance.lastActive < (new Date().getTime() - (24 * 60 * 60 * 1000))) {
        instance.lastActive = new Date().getTime();
      }
    }
    return instance;
  }

}
