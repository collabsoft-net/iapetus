import { RestClientMethods } from '@collabsoft-net/enums';
import { CachingService, RestClient as IRestClient } from '@collabsoft-net/types';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { AbstractRestClient } from './AbstractRestClient';

export class FirebaseRestClient extends AbstractRestClient implements IRestClient {

  constructor(private AP: AP.PlatformInstance, baseURL: string, config: AxiosRequestConfig = {}, cacheService?: CachingService, cacheDuration?: number) {
    super(baseURL, config, cacheService, cacheDuration);
  }

  cached(duration: number) {
    return new FirebaseRestClient(this.AP, this.baseURL, this.config, this.cacheService, duration);
  }

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const token = await this.AP.context.getToken();
    return super.request(method, endpoint, data, params, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${token}`
      }
    }, cacheDuration || this.duration);
  }

  static getIdentifier(): symbol {
    return Symbol.for('FirebaseRestClient');
  }

}
