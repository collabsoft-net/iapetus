import '@collabsoft-net/functions';

import { ForgeInstanceDTO } from '@collabsoft-net/dto';
import { ForgeInstance } from '@collabsoft-net/entities';
import { isNullOrEmpty } from '@collabsoft-net/helpers';
import { AbstractService, ForgeRemoteTokenService } from '@collabsoft-net/services';
import { CachingService, ForgeRemoteToken, ForgeUserSession } from '@collabsoft-net/types';
import * as express from 'express';
import { injectable } from 'inversify';
import { JWTPayload } from 'jose';
import jwt from 'jwt-simple';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';

import { AbstractJWTStrategy } from './AbstractJWTStrategy';

@injectable()
export abstract class AbstractForgeRemoteTokenStrategy<T extends AtlasSession> extends AbstractJWTStrategy<ForgeRemoteToken, T> {

  constructor(private allowAnonymousAccess = false) {
    super();
  }

  protected get strategyOptions(): StrategyOptions {
    return {
      secretOrKeyProvider: async (_: Express.Request, rawJwtToken: string, done: (err: Error|null, payload?: string) => void) => {
        try {
          const token = jwt.decode(rawJwtToken, '', true) as ForgeRemoteToken;
          if (isNullOrEmpty(token.iss)) throw new Error('Invalid JWT token');
          if (isNullOrEmpty(token.exp) || (token.exp < new Date().getTime())) throw new Error('Session expired');
          if (isNullOrEmpty(token.sub) && !this.allowAnonymousAccess) throw new Error('Anonymous access is not allowed');

          const service = await this.toForgeInstanceService(token);
          const instance = await service.findById(token.iss);
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

  protected abstract toCacheService(token: ForgeRemoteToken): Promise<CachingService>;
  protected abstract toForgeInstanceService(token: ForgeRemoteToken): Promise<AbstractService<ForgeInstance, ForgeInstanceDTO>>;
  protected abstract toSession(token: ForgeRemoteToken, instance: ForgeInstance, appSystemToken?: string, appUserToken?: string): Promise<T>;

  protected async process(_request: express.Request, token?: ForgeRemoteToken): Promise<T> {
    if (!token) throw new Error('Invalid JWT token');
    const { iss, exp, sub } = token;
    if (isNullOrEmpty(iss)) throw new Error('Invalid JWT token');
    if (isNullOrEmpty(exp) || (exp < new Date().getTime())) throw new Error('Session expired');
    if (isNullOrEmpty(sub)) throw new Error('Anonymous access is not allowed');

    const service = await this.toForgeInstanceService(token);
    const instance = await service.findById(iss);
    if (instance) {
      const { appSystemToken, appUserToken } = await this.getForgeTokens(instance, token);
      return this.toSession(token, instance, appSystemToken, appUserToken);
    } else {
      throw new Error('Customer instance not found');
    }
  }

  private async getForgeTokens(instance: ForgeInstance, token: ForgeRemoteToken): Promise<{ appSystemToken?: string, appUserToken?: string }> {
    const cacheService = await this.toCacheService(token);

    const result: {
      appSystemToken?: string;
      appUserToken?: string;
    } = {
      appSystemToken: undefined,
      appUserToken: undefined
    };

    // Get the offline appSystemToken from the instance, if available
    // Make sure that it has not already expired before using it
    const offlineInstanceAppSystemToken = instance.appSystemTokenKey && await cacheService.get<string>(instance.appSystemTokenKey) || undefined;
    if (offlineInstanceAppSystemToken) {
      try {
        const payload = await jwt.decode(offlineInstanceAppSystemToken, '', true) as JWTPayload;
        if (!isNullOrEmpty(payload.exp) && payload.exp > new Date().getTime()) {
          result.appSystemToken = offlineInstanceAppSystemToken;
        }
      } catch {
        // We are going to ignore this error, as the token is optional
      }
    }

    // Get the current user session ID
    const { sessionId } = token;
    if (sessionId) {

      // If we have a user session ID, retrieve it from cache
      const userSession = await cacheService.get<ForgeUserSession>(sessionId) || undefined;

      // Check if we have an active session
      if (userSession) {

        // If we have an active session, get the forge tokens from the session object
        const { appSystemToken, appUserToken } = userSession;

        // If we have an appSystemToken in session
        // Make sure that it has not already expired before using it
        if (appSystemToken) {
          try {
            const payload = await jwt.decode(appSystemToken, '', true) as JWTPayload;
            if (!isNullOrEmpty(payload.exp) && payload.exp > new Date().getTime()) {
              result.appSystemToken = appSystemToken;
            }
          } catch {
            // We are going to ignore this error, as the token is optional
          }
        }

        // If we have an appUserToken in session
        // Make sure that it has not already expired before using it
        if (appUserToken) {
          try {
            const payload = await jwt.decode(appUserToken, '', true) as JWTPayload;
            if (!isNullOrEmpty(payload.exp) && payload.exp > new Date().getTime()) {
              result.appUserToken = appUserToken;
            }
          } catch {
            // We are going to ignore this error, as the token is optional
          }
        }

      }
    }

    // Return the forge tokens
    return result;
  }

}
