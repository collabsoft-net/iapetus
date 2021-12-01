import { ACInstance } from '@collabsoft-net/entities';
import { RestClientMethods } from '@collabsoft-net/enums';
import { RestClient } from '@collabsoft-net/types';
import { createQueryStringHash, encodeSymmetric, SymmetricAlgorithm} from 'atlassian-jwt';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { stringify } from 'query-string';

import { AbstractRestClient } from './AbstractRestClient';

const IMPERSONATION_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const AUTH_SERVER = 'https://oauth-2-authorization-server.services.atlassian.com';

export abstract class AbstractAtlasRestClient extends AbstractRestClient implements RestClient {

  protected _accountId?: string;

  constructor(protected instance: ACInstance, protected config: AxiosRequestConfig = {}) {
    super(instance.baseUrl, config);
  }

  get accountId(): string|undefined {
    return this._accountId;
  }

  abstract as(accountId: string, oauthClientId: string, sharedSecret: string): AbstractAtlasRestClient;

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, headers?: Record<string, string>): Promise<AxiosResponse<T>> {
    const options: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      params,
      headers
    };
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    options.headers['X-ExperimentalApi'] = 'opt-in';
    options.headers['Authorization'] = this.accountId
      ? `Bearer ${await this.getAccessToken()}`
      : `JWT ${this.getSignedJWT(options)}`;

      return this.client(endpoint, options);
  }

  private getSignedJWT(options: AxiosRequestConfig) {
    return encodeSymmetric(this.createJwtPayload(options), this.instance.sharedSecret, SymmetricAlgorithm.HS256);
  }

  private createJwtPayload(options: AxiosRequestConfig) {
    const now = new Date().getTime();
    const { key, clientKey } = this.instance;

    return {
      iss: key,
      iat: now,
      exp: now + (15 * 60 * 1000),
      qsh: createQueryStringHash({
        method: options.method || 'get',
        pathname: options.url,
        query: this.normalizeQuery(options.params)
      }),
      aud: [ clientKey ]
    };
  }

  private async getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    const { oauthClientId, sharedSecret } = this.instance;

    const { data: { access_token } } = await this.client({
      method: RestClientMethods.POST,
      url: `${AUTH_SERVER}/oauth2/token`,
      data: stringify({
        grant_type: IMPERSONATION_GRANT_TYPE,
        assertion: encodeSymmetric({
          iss: `urn:atlassian:connect:clientid:${oauthClientId}`,
          iat: now,
          sub: `urn:atlassian:connect:useraccountid:${this.accountId}`,
          exp: now + 60,
          tnt: this.instance.baseUrl,
          aud: AUTH_SERVER
        }, sharedSecret, SymmetricAlgorithm.HS256)
      }),
      headers: { 'accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return access_token;
  }
}