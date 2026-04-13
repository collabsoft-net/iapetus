import '@collabsoft-net/functions';

import { decodeSymmetric, SymmetricAlgorithm } from '@atlassian/atlassian-jwt';
import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { AbstractService } from '@collabsoft-net/services';
import * as express from 'express';
import { injectable } from 'inversify';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';

import { AbstractJWTStrategy } from './AbstractJWTStrategy';

@injectable()
export abstract class AbstractAtlassianTokenJWTStrategy<T extends ACInstance, X extends ACInstanceDTO, Y extends AtlasSession> extends AbstractJWTStrategy<Atlassian.JWT, Y> {

  constructor(private allowAnonymousAccess = false) {
    super();
  }

  protected abstract toConnectInstanceService(token: Atlassian.JWT): Promise<AbstractService<T, X>>;

  protected get strategyOptions(): StrategyOptions {
    return {
      secretOrKeyProvider: async (_: Express.Request, rawJwtToken: string, done: (err: Error|null, payload?: string) => void) => {
        try {
          const payload = decodeSymmetric(rawJwtToken, '', SymmetricAlgorithm.HS256, true) as Atlassian.JWT;
          const service = await this.toConnectInstanceService(payload);
          const instance = await service.findById(payload.iss) || await service.findByProperty('clientKey', payload.iss);
          if (!instance) throw new Error('Could not find customer instance, unauthorized access not allowed');
          done(null, instance.sharedSecret);
        } catch (error) {
          done(error as Error);
        }
      },
      jwtFromRequest: (req) => {
        return ExtractJwt.fromAuthHeaderWithScheme('JWT')(req) || ExtractJwt.fromUrlQueryParameter('jwt')(req);
      }
    };
  }

  protected async process(request: express.Request, payload?: Atlassian.JWT): Promise<Y> {
    if (!payload) throw new Error('Invalid Atlassian JWT token');
    const { iss, sub } = payload;

    if (!this.allowAnonymousAccess && isNullOrEmpty(sub)) {
      throw new Error('Anonymous access is not allowed');
    }

    const service = await this.toConnectInstanceService(payload);
    let instance = await service.findById(iss) || await service.findByProperty('clientKey', iss);
    if (instance) {
      instance = this.updateLastActive(instance, request);
      instance = await service.save(instance);
      return this.toSession(payload, instance);
    } else {
      throw new Error('Customer instance not found');
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
