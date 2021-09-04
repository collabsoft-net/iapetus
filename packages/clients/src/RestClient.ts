import { RestClientMethods } from '@collabsoft-net/enums';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { AbstractRestClient } from './AbstractRestClient';

export class RestClient extends AbstractRestClient {

  constructor(private AP: AP.Instance, baseURL: string, config: AxiosRequestConfig = {}) {
    super(baseURL, config);
    this.AP = AP;
  }

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const token = await this.AP.context.getToken();
    return super.request(method, endpoint, data, params, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${token}`
      }
    });
  }

}
