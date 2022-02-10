import { RestClientMethods } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { RestClient } from '@collabsoft-net/types';
import { AxiosResponse, AxiosResponseHeaders } from 'axios';
import qs from 'query-string';

export class APRestClient implements RestClient {

  constructor(protected AP: AP.Instance) {}

  async get<T>(endpoint: string, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.GET, endpoint, undefined, params);
  }

  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.POST, endpoint, data, params);
  }

  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.PUT, endpoint, data, params);
  }

  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.PATCH, endpoint, data, params);
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
        contentType: 'application/json',
        experimental: true
      });

      let result;
      try {
        result = JSON.parse(body)
      } catch (error) {
        result = body;
      }

      return {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: this.getHeaders(xhr),
        config: {},
        data: result
      };
    } catch (error) {
      if (isOfType<AP.RequestResponseError>(error, 'xhr')) {
        const { err, xhr } = error as AP.RequestResponseError;
        return {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: this.getHeaders(xhr),
          config: {},
          data: err as unknown as T
        };
      } else {
        return {
          status: 500,
          statusText: '',
          headers: {},
          config: {},
          data: error as unknown as T
        };
      }
    }
  }

  protected getUrl(endpoint: string, params?: Record<string, string|number|boolean>): string {
    if (params) {
      const querystring = qs.stringify(params);
      endpoint = `${endpoint}?${querystring}`;
    }

    return endpoint;
  }

  protected getHeaders(xhr: AP.RequestResponseXHRObject): AxiosResponseHeaders {
    const result: AxiosResponseHeaders = {};
    if (typeof xhr.getAllResponseHeaders === 'function') {
      const headers = xhr.getAllResponseHeaders().split('\r\n');
      headers.forEach(item => {
        const [ name, ...value ] = item.split(':');
        result[name] = value.join(';');
      });
    }
    return result;
  }

}
