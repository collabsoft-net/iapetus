import { Applications, RestClientMethods } from '@collabsoft-net/enums';
import { CachingService, RestClient as IRestClient } from '@collabsoft-net/types';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

import { ForgeRestClient } from './ForgeRestClient';
import { ForgeInstance } from '@collabsoft-net/entities';

export class ForgeRemoteRestClient extends ForgeRestClient implements IRestClient {

  protected client: AxiosInstance;
  private signal = axios.CancelToken.source();
  private _appUserToken?: string;

  get abortController(): CancelTokenSource {
    return this.signal;
  }

  constructor(private instance: ForgeInstance, private config: AxiosRequestConfig = {}, cacheService?: CachingService, cacheDuration?: number) {
    // The product is irrelevant because we will be overriding the request method
    super(Applications.JIRA, cacheService, cacheDuration);

    this.client = axios.create(Object.assign({}, config, {
      baseURL: instance.apiBaseUrl,
      cancelToken: this.signal.token,
    }));
  }

  as(appUserToken: string) {
    const instance = new ForgeRemoteRestClient(this.instance, this.config, this.cacheService, this.duration);
    instance._appUserToken = appUserToken;
    return instance;
  }

  cached(duration: number) {
    return new ForgeRemoteRestClient(this.instance, this.config, this.cacheService, duration);
  }

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>> {

    const configuration: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        ...this._appUserToken || this.instance.appToken ? { Authorization: `Bearer ${this._appUserToken ? this._appUserToken : this.instance.appToken}` } : {}
      }
    };

    const fetchFromRemote = async () => this.client({
      ...configuration,
      method,
      url: endpoint,
      data,
      params
    });

    if (this.cacheService) {
      try {
        const cacheKey = this.cacheService.toCacheKey(method, endpoint, JSON.stringify(data), JSON.stringify(params), JSON.stringify(config?.headers || {}));
        const result = await this.cacheService.get(cacheKey, fetchFromRemote, cacheDuration || this.duration);
        return result || fetchFromRemote();
      } catch (_ignored) {
        return fetchFromRemote();
      }
    } else {
      return fetchFromRemote();
    }
  }

  static getIdentifier(): symbol {
    return Symbol.for('ForgeRemoteRestClient');
  }

}
