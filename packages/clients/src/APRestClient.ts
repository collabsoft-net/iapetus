import { RestClientMethods } from '@collabsoft-net/enums';
import { RestClient } from '@collabsoft-net/types';
import { AxiosResponse } from 'axios';
import qs from 'query-string';

export class APRestClient implements RestClient {

  constructor(private AP: AP.Instance) {}

  async get<T>(endpoint: string, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.GET, endpoint, undefined, params);
  }

  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.POST, endpoint, data, params);
  }

  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.PUT, endpoint, data, params);
  }

  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.DELETE, endpoint, data, params);
  }

  protected async request<T>(type: string, url: string, data: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    const client = this.AP.request;
    try {
      const { body, xhr } = await client({
        type,
        url: this.getUrl(url, params),
        data: data ? JSON.stringify(data) : undefined,
        contentType: 'application/json'
      });

      return {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: xhr.getAllResponseHeaders().split('\r\n'),
        config: {},
        data: JSON.parse(body)
      };
    } catch (error) {
      const { err, xhr } = error as AP.RequestResponseError;
      return {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: xhr.getAllResponseHeaders().split('\r\n'),
        config: {},
        data: err as unknown as T
      };
    }
  }

  private getUrl(endpoint: string, params?: Record<string, string|number|boolean>): string {
    if (params) {
      const querystring = qs.stringify(params);
      endpoint = `${endpoint}?${querystring}`;
    }

    return endpoint;
  }

}
