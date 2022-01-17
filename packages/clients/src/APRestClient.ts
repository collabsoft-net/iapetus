import { RestClientMethods } from '@collabsoft-net/enums';
import { RestClient } from '@collabsoft-net/types';
import { AxiosResponse, AxiosResponseHeaders } from 'axios';
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

  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.PATCH, endpoint, data, params);
  }

  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    return this.request(RestClientMethods.DELETE, endpoint, data, params);
  }

  protected async request<T>(type: string, url: string, data: unknown, params?: Record<string, string|number|boolean>): Promise<AxiosResponse<T>> {
    const client = this.AP.request || await new Promise<AP.Request>((resolve) => this.AP.require<AP.Request>('request', resolve));
    try {
      const { body, xhr } = await new Promise<AP.RequestResponse>((resolve, reject) => client({
        type,
        url: this.getUrl(url, params),
        data: data ? JSON.stringify(data) : undefined,
        contentType: 'application/json',
        success: (responseText, _statusText, xhr) => resolve({ body: responseText, xhr }),
        error: (xhr, _statusText, errorThrown: Error) => reject({ err: errorThrown, xhr }),
        experimental: true
      }));

      return {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: this.getHeaders(xhr),
        config: {},
        data: JSON.parse(body)
      };
    } catch (error) {
      const { err, xhr } = error as AP.RequestResponseError;
      return {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: this.getHeaders(xhr),
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

  private getHeaders(xhr: AP.RequestResponseXHRObject) {
    const result: AxiosResponseHeaders = {};
    const headers = xhr.getAllResponseHeaders().split('\r\n');
    headers.forEach(item => {
      const [ name, ...value ] = item.split(':');
      result[name] = value.join(';');
    });
    return result;
  }

}
