import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { decodeSymmetric, SymmetricAlgorithm } from 'atlassian-jwt';
import * as express from 'express';
import { injectable } from 'inversify';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';

import { AbstractJWTStrategy } from './AbstractJWTStrategy';

@injectable()
export abstract class AbstractAtlassianTokenJWTStrategy<T extends Session> extends AbstractJWTStrategy<Atlassian.JWT, T> {

  protected abstract get service(): AbstractService<ACInstance, ACInstanceDTO>;

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

  protected async process(payload: Atlassian.JWT, request: express.Request): Promise<T> {
    const { iss } = payload;

    const instance = await this.service.findById(iss) || await this.service.findByProperty('clientKey', iss);
    if (instance) {
      await this.updateLastActive(instance, request);
      return this.toSession(payload, instance);
    } else {
      throw new Error('Customer instance not found');
    }
  }

  protected abstract toSession(payload: Atlassian.JWT, instance: ACInstance): Promise<T>;

  private async updateLastActive(instance: ACInstance, { headers }: express.Request) {
    if (headers && typeof headers['X-Collabsoft-UpdateLastActive'] === 'string' && headers['X-Collabsoft-UpdateLastActive'] === 'true') {
      // Only update the lastActive if non-existant or less than 24 hours ago
      if (!instance.lastActive || instance.lastActive < (new Date().getTime() - (24 * 60 * 60 * 1000))) {
        instance.lastActive = new Date().getTime();
        await this.service.save(instance);
      }
    }
  }

}
