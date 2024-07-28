import '@collabsoft-net/functions';

import { ACInstance } from '@collabsoft-net/entities';
import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { decodeSymmetric, SymmetricAlgorithm } from 'atlassian-jwt';
import * as express from 'express';
import { injectable } from 'inversify';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';

import { AbstractJWTStrategy } from './AbstractJWTStrategy';

@injectable()
export abstract class AbstractAtlassianTokenJWTStrategy<T extends Session> extends AbstractJWTStrategy<Atlassian.JWT, T> {

  protected get strategyOptions(): StrategyOptions {
    return {
      secretOrKeyProvider: async (_: Express.Request, rawJwtToken: string, done: (err: Error|null, payload?: string) => void) => {
        try {
          const payload = decodeSymmetric(rawJwtToken, '', SymmetricAlgorithm.HS256, true);
          const instance = await this.service.findById(payload.iss) || await this.service.findByProperty('clientKey', payload.iss);
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

  constructor(private allowAnonymousAccess = false) {
    super();
  }

  protected async process(request: express.Request, payload?: Atlassian.JWT,): Promise<T> {
    if (!payload) throw new Error('Invalid Atlassian JWT token');
    const { iss, sub } = payload;

    if (!this.allowAnonymousAccess && isNullOrEmpty(sub)) {
      throw new Error('Anonymous access is not allowed');
    }

    const instance = await this.service.findById(iss) || await this.service.findByProperty('clientKey', iss);
    if (instance) {
      await this.updateLastActive(instance, request);
      return this.toSession(payload, instance);
    } else {
      throw new Error('Customer instance not found');
    }
  }

  protected abstract toSession(payload: Atlassian.JWT, instance: ACInstance): Promise<T>;


}
