import { RestClientMethods } from '@collabsoft-net/enums';
import { CachingService, RestClient as IRestClient } from '@collabsoft-net/types';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { AbstractRestClient } from './AbstractRestClient';

export class RestClient extends AbstractRestClient implements IRestClient {

  #duration?: number;

  constructor(private AP: AP.Instance, baseURL: string, config: AxiosRequestConfig = {}, cacheService?: CachingService, cacheDuration?: number) {
    super(baseURL, config, cacheService, cacheDuration);
  }

  cached(duration: number) {
    return new RestClient(this.AP, this.baseURL, this.config, this.cacheService, duration);
  }

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration = this.#duration): Promise<AxiosResponse<T>> {
    const token = await this.AP.context.getToken();
    return super.request(method, endpoint, data, params, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${token}`
      }
    }, cacheDuration);
  }

  static getIdentifier(): symbol {
    return Symbol.for('RestClient');
  }

}
