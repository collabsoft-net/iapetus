import { RestClientEndpoints, RestClientMethods } from '@collabsoft-net/enums';
import { CachingService, RestClient as IRestClient } from '@collabsoft-net/types';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { TokenExchangeDTO } from '@collabsoft-net/dto';

import { ForgeRestClient } from './ForgeRestClient';
import { ForgeInvokeClient } from './ForgeInvokeClient';

export class NativeRemoteRestClient extends ForgeRestClient implements IRestClient {

  private token?: TokenExchangeDTO;
  protected client: AxiosInstance;
  private signal = axios.CancelToken.source();

  get abortController(): CancelTokenSource {
    return this.signal;
  }

  constructor(private forgeInvokeClient: ForgeInvokeClient, private baseURL: string, private config: AxiosRequestConfig = {}, cacheService?: CachingService, cacheDuration?: number) {
    // The product is irrelevant because we will be overriding the request method
    super('jira', cacheService, cacheDuration);

    this.client = axios.create(Object.assign({}, config, {
      baseURL: baseURL,
      cancelToken: this.signal.token,
    }));
  }

  cached(duration: number) {
    return new NativeRemoteRestClient(this.forgeInvokeClient, this.baseURL, this.config, this.cacheService, duration);
  }

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>> {

    const token = await this.getToken();

    const configuration: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        ...token ? { Authorization: `Bearer ${token.token}` } : {}
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

  async getToken(): Promise<TokenExchangeDTO|undefined> {
    if (!this.token || this.token.expires <= new Date().getTime()) {
      const { data } = await this.forgeInvokeClient.get<TokenExchangeDTO>(RestClientEndpoints.TOKEN_EXCHANGE).catch(() => ({ data: undefined }));
      this.token = data;
    }
    return this.token;
  }

  static getIdentifier(): symbol {
    return Symbol.for('FirebaseRestClient');
  }

}
