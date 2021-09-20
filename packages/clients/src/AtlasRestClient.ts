import { ACInstance } from '@collabsoft-net/entities';
import { RestClientMethods } from '@collabsoft-net/enums';
import { RestClient } from '@collabsoft-net/types';
import { createQueryStringHash, encodeSymmetric, SymmetricAlgorithm} from 'atlassian-jwt';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { stringify } from 'query-string';

import { AbstractRestClient } from './AbstractRestClient';

const IMPERSONATION_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const AUTH_SERVER = 'https://oauth-2-authorization-server.services.atlassian.com';

export class AtlasRestClient extends AbstractRestClient implements RestClient {

  private _accountId!: string;
  private oauthClientId!: string;
  private sharedSecret!: string;
  private impersonate: boolean;

  constructor(private addonKey: string, private instance: ACInstance, private config: AxiosRequestConfig = {}) {
    super(instance.baseUrl, config);
    this.impersonate = false;
  }

  get accountId(): string {
    return this._accountId;
  }

  as(accountId: string, oauthClientId: string, sharedSecret: string): AtlasRestClient {
    const instance = new AtlasRestClient(this.addonKey, this.instance, this.config);
    instance._accountId = accountId;
    instance.oauthClientId = oauthClientId;
    instance.sharedSecret = sharedSecret;
    instance.impersonate = true;
    return instance;
  }

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
    options.headers['Authorization'] = this.impersonate
      ? `Bearer ${await this.getAccessToken()}`
      : `JWT ${this.getSignedJWT(options)}`;

      return this.client(endpoint, options);
  }

  private getSignedJWT(options: AxiosRequestConfig) {
    return encodeSymmetric(this.createJwtPayload(options), this.instance.sharedSecret, SymmetricAlgorithm.HS256);
  }

  private createJwtPayload(options: AxiosRequestConfig) {
    const now = new Date().getTime();

    return {
      iss: this.addonKey,
      iat: now,
      exp: now + (15 * 60 * 1000),
      qsh: createQueryStringHash({
        method: options.method || 'get',
        pathname: options.url,
        query: this.normalizeQuery(options.params)
      }),
      aud: [ this.instance.clientKey ]
    };
  }

  private async getAccessToken() {
    const now = Math.floor(Date.now() / 1000);

    const { data: { access_token } } = await this.client({
      method: RestClientMethods.POST,
      url: `${AUTH_SERVER}/oauth2/token`,
      data: stringify({
        grant_type: IMPERSONATION_GRANT_TYPE,
        assertion: encodeSymmetric({
          iss: `urn:atlassian:connect:clientid:${this.oauthClientId}`,
          iat: now,
          sub: `urn:atlassian:connect:useraccountid:${this.accountId}`,
          exp: now + 60,
          tnt: this.instance.baseUrl,
          aud: AUTH_SERVER
        }, this.sharedSecret, SymmetricAlgorithm.HS256)
      }),
      headers: { 'accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return access_token;
  }
}
