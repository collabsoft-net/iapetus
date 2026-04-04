import { RestClientMethods } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { CachingService, RestClient as IRestClient } from '@collabsoft-net/types';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { AbstractRestClient } from './AbstractRestClient';

export class FirebaseRestClient extends AbstractRestClient implements IRestClient {

  constructor(private AP: AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance, baseURL: string, config: AxiosRequestConfig = {}, cacheService?: CachingService, cacheDuration?: number) {
    super(baseURL, config, cacheService, cacheDuration);
  }

  cached(cacheService: CachingService, duration: number) {
    return new FirebaseRestClient(this.AP, this.baseURL, this.config, cacheService, duration);
  }

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const configuration: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers
      }
    };

    if (isOfType<AP.JiraInstance>(this.AP, 'jira') || isOfType<AP.ConfluenceInstance>(this.AP, 'confluence')) {
      const token = await this.AP.context.getToken();
      configuration.headers = { ...configuration.headers, Authorization: `Bearer ${token}` };
    }

    return super.request(method, endpoint, data, params, configuration, cacheDuration || this.duration);
  }

  static getIdentifier(): symbol {
    return Symbol.for('FirebaseRestClient');
  }

}
