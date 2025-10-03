import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { AbstractService } from '@collabsoft-net/services';
import { decodeSymmetric, SymmetricAlgorithm } from 'atlassian-jwt';
import * as express from 'express';
import { injectable } from 'inversify';

import { AbstractBearerStrategy } from './AbstractBearerStrategy';

@injectable()
export abstract class AbstractAtlassianTokenBearerStrategy<T extends ACInstance, X extends ACInstanceDTO, Y extends Record<string, unknown>> extends AbstractBearerStrategy<Y> {

  protected abstract get service(): AbstractService<T, X>;

  constructor(private allowAnonymousAccess = false) {
    super();
  }

  protected async process(request: express.Request, token?: string): Promise<Y> {
    if (!token) throw new Error('Invalid Bearer token');

    const { iss, exp } = decodeSymmetric(token, '', SymmetricAlgorithm.HS256, true);
    const now = Math.round(new Date().getTime() / 1000);
    if (exp < now) throw new Error('Session expired');

    const instance = await this.service.findById(iss) || await this.service.findByProperty('clientKey', iss);
    if (instance) {
      await this.updateLastActive(instance, request);
      const payload = decodeSymmetric(token, instance.sharedSecret, SymmetricAlgorithm.HS256) as Atlassian.JWT;

      if (!this.allowAnonymousAccess && isNullOrEmpty(payload.sub)) {
        throw new Error('Anonymous access is not allowed');
      }

      return this.toSession(payload, instance);
    } else {
      throw new Error('Customer instance not found');
    }
  }

  protected abstract toSession(payload: Atlassian.JWT, instance: T): Promise<Y>;

  protected async updateLastActive(instance: T, { headers }: express.Request) {
    if (headers && typeof headers['X-Collabsoft-UpdateLastActive'] === 'string' && headers['X-Collabsoft-UpdateLastActive'] === 'true') {
      // Only update the lastActive if non-existant or less than 24 hours ago
      if (!instance.lastActive || instance.lastActive < (new Date().getTime() - (24 * 60 * 60 * 1000))) {
        instance.lastActive = new Date().getTime();
        await this.service.save(instance);
      }
    }
  }

}
