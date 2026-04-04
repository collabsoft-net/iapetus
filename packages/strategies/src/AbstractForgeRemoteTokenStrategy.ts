import '@collabsoft-net/functions';

import { ForgeInstanceDTO } from '@collabsoft-net/dto';
import { ForgeInstance } from '@collabsoft-net/entities';
import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { AbstractService, ForgeRemoteTokenService } from '@collabsoft-net/services';
import { CachingService, ForgeRemoteToken } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import jwt from 'jwt-simple';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';

import { AbstractJWTStrategy } from './AbstractJWTStrategy';

@injectable()
export abstract class AbstractForgeRemoteTokenStrategy<T extends ForgeSession> extends AbstractJWTStrategy<ForgeRemoteToken, T> {

  protected abstract get service(): AbstractService<ForgeInstance, ForgeInstanceDTO>;
  protected abstract get cacheService(): CachingService;

  constructor(private allowAnonymousAccess = false) {
    super();
  }

  protected get strategyOptions(): StrategyOptions {
    return {
      secretOrKeyProvider: async (_: Express.Request, rawJwtToken: string, done: (err: Error|null, payload?: string) => void) => {
        try {
          const { iss, exp, sub } = jwt.decode(rawJwtToken, '', true) as ForgeRemoteToken;
          if (isNullOrEmpty(iss)) throw new Error('Invalid JWT token');
          if (isNullOrEmpty(exp) || (exp < new Date().getTime())) throw new Error('Session expired');
          if (isNullOrEmpty(sub) && !this.allowAnonymousAccess) throw new Error('Anonymous access is not allowed');

          const instance = await this.service.findById(iss);
          if (!instance) throw new Error('Could not find customer instance, unauthorized access not allowed');

          const hash = ForgeRemoteTokenService.getHash(instance);
          done(null, hash);
        } catch (error) {
          done(error as Error);
        }
      },
      jwtFromRequest: (req) => {
        return ExtractJwt.fromAuthHeaderWithScheme('JWT')(req) || ExtractJwt.fromUrlQueryParameter('jwt')(req);
      }
    };
  }

  protected abstract toSession(payload: ForgeRemoteToken, instance: ForgeInstance, appSystemToken?: string, appUserToken?: string): Promise<T>;

  protected async process(_request: express.Request, payload?: ForgeRemoteToken): Promise<T> {
    if (!payload) throw new Error('Invalid JWT token');
    const { iss, exp, sub, appSystemTokenKey, appUserTokenKey } = payload;
    if (isNullOrEmpty(iss)) throw new Error('Invalid JWT token');
    if (isNullOrEmpty(exp) || (exp < new Date().getTime())) throw new Error('Session expired');
    if (isNullOrEmpty(sub)) throw new Error('Anonymous access is not allowed');

    const instance = await this.service.findById(iss);
    if (instance) {
      const appSystemToken = appSystemTokenKey && await this.cacheService.get<string>(appSystemTokenKey) || undefined;
      const appUserToken = appUserTokenKey && await this.cacheService.get<string>(appUserTokenKey) || undefined;
      return this.toSession(payload, instance, appSystemToken, appUserToken);
    } else {
      throw new Error('Customer instance not found');
    }
  }

}
