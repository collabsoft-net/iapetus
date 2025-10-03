import '@collabsoft-net/functions';

import { isNullOrEmpty } from '@collabsoft-net/helpers';
import * as express from 'express';
import { injectable } from 'inversify';
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';

import { AbstractBearerStrategy } from './AbstractBearerStrategy';

@injectable()
export abstract class AbstractForgeTokenBearerStrategy<T, X extends Session> extends AbstractBearerStrategy<T, X> {

  constructor(private allowAnonymousAccess = false) {
    super();
  }

  protected async process(request: express.Request, token?: T): Promise<X> {
    if (!token || typeof token !== 'string') throw new Error('Invalid Bearer token');

    // Make sure to check if this is even a valid FIT
    const unverifiedPayload: Atlassian.FIT = decodeJwt(token);
    if (!unverifiedPayload.app?.id) {
      throw new Error('Invalid Bearer token');
    }

    // Verify the token using the Atlassian public key
    const JWKS = createRemoteJWKSet(new URL('https://forge.cdn.prod.atlassian-dev.net/.well-known/jwks.json'));
    const { payload } = await jwtVerify<Atlassian.FIT>(token, JWKS, {
      audience: unverifiedPayload.app.id,
      issuer: 'forge/invocation-token',
    });

    if (!this.allowAnonymousAccess && isNullOrEmpty(payload.sub)) {
      throw new Error('Anonymous access is not allowed');
    }

    const appToken = request.header('x-forge-oauth-system');
    const userToken = request.header('x-forge-oauth-user');

    return this.toSession(payload, appToken, userToken);
  }

  protected abstract toSession(payload: Atlassian.FIT, appToken?: string, userToken?: string): Promise<X>;

}
