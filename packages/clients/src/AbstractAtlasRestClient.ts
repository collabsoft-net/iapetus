import { ACInstance, ForgeInstance } from '@collabsoft-net/entities';
import { Applications, RestClientMethods } from '@collabsoft-net/enums';
import { ClientError, isOfType } from '@collabsoft-net/helpers';
import { CachingService, RestClient } from '@collabsoft-net/types';
import { createQueryStringHash, encodeSymmetric, SymmetricAlgorithm} from '@atlassian/atlassian-jwt';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { AbstractRestClient } from './AbstractRestClient';

const IMPERSONATION_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const AUTH_SERVER = 'https://oauth-2-authorization-server.services.atlassian.com';

export abstract class AbstractAtlasRestClient<
  TApplication extends Applications,
  TResponseError = TApplication extends Applications.JIRA ? Jira.ResponseError : TApplication extends Applications.CONFLUENCE ? Confluence.ResponseError : unknown
> extends AbstractRestClient implements RestClient {

  protected _accountId?: string;
  protected appSystemToken: string|undefined;

  constructor(instance: ACInstance, config?: AxiosRequestConfig, cacheService?: CachingService, cacheDuration?: number);
  constructor(instance: ForgeInstance, appSystemToken?: string, config?: AxiosRequestConfig, cacheService?: CachingService, cacheDuration?: number);
  constructor(protected instance: ACInstance|ForgeInstance, appSystemTokenOrConfig?: string|AxiosRequestConfig, configOrCacheService?: AxiosRequestConfig|CachingService, cacheServiceOrCacheDuration?: CachingService|number, cacheDuration?: number) {
    super(isOfType<ForgeInstance>(
      instance, 'apiBaseUrl') ? instance.apiBaseUrl : instance.baseUrl,
      typeof appSystemTokenOrConfig !== 'string' ? appSystemTokenOrConfig : !isOfType<CachingService>(configOrCacheService, 'toCacheKey') ? configOrCacheService : {},
      isOfType<CachingService>(configOrCacheService, 'toCacheKey') ? configOrCacheService : typeof cacheServiceOrCacheDuration !== 'number' ? cacheServiceOrCacheDuration : undefined,
      typeof cacheServiceOrCacheDuration === 'number' ? cacheServiceOrCacheDuration : cacheDuration
    );

    this.appSystemToken = typeof appSystemTokenOrConfig === 'string' ? appSystemTokenOrConfig : undefined;
  }

  get accountId(): string|undefined {
    return this._accountId;
  }

  abstract cached(cacheService: CachingService, duration: number): AbstractAtlasRestClient<TApplication, TResponseError>;

  abstract as(accountId: string): AbstractAtlasRestClient<TApplication, TResponseError>;
  abstract as(accountId: string, oauthClientId: string, sharedSecret: string): AbstractAtlasRestClient<TApplication, TResponseError>;

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const options: AxiosRequestConfig = {
      ...config,
      method,
      url: endpoint,
      data,
      params: params ? this.normalizeQuery(params) : undefined,
    };
    options.headers = options.headers || {};
    options.headers['X-ExperimentalApi'] = 'opt-in';

    if (isOfType<ForgeInstance>(this.instance, 'apiBaseUrl')) {
      const token = this.accountId ? await this.getForgeToken() : this.appSystemToken;
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    } else {
      options.headers['Authorization'] = this.accountId
        ? `Bearer ${await this.getConnectToken(this.instance.oauthClientId, this.instance.sharedSecret)}`
        : `JWT ${this.getSignedConnectJWT(options, this.instance.sharedSecret)}`;
    }

    const hasContentType = Object.keys(options.headers).some(key => key.toLowerCase() === 'content-type');
    if (!hasContentType) {
      options.headers['Content-Type'] = 'application/json';
    }

    const fetchFromRemote = async () => this.client(endpoint, options);

    if (this.cacheService) {
      try {
        const cacheKey = this.cacheService.toCacheKey(method, endpoint, JSON.stringify(options));
        const result = await this.cacheService.get(cacheKey, fetchFromRemote, cacheDuration || this.duration);
        return result || fetchFromRemote().catch(error => { throw ClientError.fromError<TResponseError>(error); });
      } catch (_ignored) {
        return fetchFromRemote().catch(error => { throw ClientError.fromError<TResponseError>(error); })
      }
    } else {
      return fetchFromRemote().catch(error => { throw ClientError.fromError<TResponseError>(error); });
    }
  }

  private getSignedConnectJWT(options: AxiosRequestConfig, sharedSecret: string) {
    return encodeSymmetric(this.createConnectJwtPayload(options), sharedSecret, SymmetricAlgorithm.HS256);
  }

  private createConnectJwtPayload(options: AxiosRequestConfig) {
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

  protected async getConnectToken(oauthClientId: string, sharedSecret: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    const params = new URLSearchParams({
      grant_type: IMPERSONATION_GRANT_TYPE,
      assertion: encodeSymmetric({
        iss: `urn:atlassian:connect:clientid:${oauthClientId}`,
        iat: now,
        sub: `urn:atlassian:connect:useraccountid:${this.accountId}`,
        exp: now + 60,
        tnt: this.instance.baseUrl,
        aud: AUTH_SERVER
      }, sharedSecret, SymmetricAlgorithm.HS256)
    });

    const { data: { access_token } } = await this.client({
      method: RestClientMethods.POST,
      url: `${AUTH_SERVER}/oauth2/token`,
      data: params.toString(),
      headers: { 'accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return access_token;
  }

  protected async getForgeToken(): Promise<string|undefined> {
    if (isOfType<ForgeInstance>(this.instance, 'cloudId')) {
      const { data } = await this.client({
        method: RestClientMethods.POST,
        url: 'https://api.atlassian.com/graphql',
        data: {
          query: `mutation forge_remote_offlineUserAuthToken($input: OfflineUserAuthTokenInput!) {
    offlineUserAuthToken(input: $input) {
      success
      errors {
        message
      }
      authToken {
        token
        ttl
      }
    }
  }`,
          variables: {
            input: {
              contextIds: [ `ari:cloud:confluence::site/${this.instance.cloudId}` ],
              userId: this.accountId,
            },
          },
        },
        headers: {
          'authorization': `Bearer ${this.appSystemToken}`,
        }

      }).catch(() => ({ data: null }));

      return data?.offlineUserAuthToken.authToken
    }
  }
}
