import { RestClientMethods } from '@collabsoft-net/enums';
import { RestClient as IRestClient } from '@collabsoft-net/types';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { AbstractRestClient } from './AbstractRestClient';

export class RestClient extends AbstractRestClient implements IRestClient {

  constructor(private AP: AP.Instance, baseURL: string, config: AxiosRequestConfig = {}) {
    super(baseURL, config);
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

  static getIdentifier(): symbol {
    return Symbol.for('RestClient');
  }

}
