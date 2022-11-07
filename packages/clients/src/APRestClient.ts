import { RestClientMethods } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { CachingService, RestClient } from '@collabsoft-net/types';
import { AxiosRequestConfig, AxiosResponse, AxiosResponseHeaders } from 'axios';
import qs from 'query-string';

export class APRestClient implements RestClient {

  #duration?: number;

  constructor(protected AP: AP.Instance, private cacheService?: CachingService) {}

  cached(duration: number): APRestClient {
    const instance = new APRestClient(this.AP, this.cacheService);
    instance.#duration = duration;
    return instance;
  }

  async get<T>(endpoint: string, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async get<T>(endpoint: string, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async get<T>(endpoint: string, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.GET, endpoint, undefined, params, duration);
  }

  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.POST, endpoint, data, params, duration);
  }

  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.PUT, endpoint, data, params, duration);
  }

  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.PATCH, endpoint, data, params, duration);
  }

  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.DELETE, endpoint, data, params, duration);
  }

  protected async request<T>(type: string, url: string, data: unknown, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const client = this.AP.request;

    const fetchFromRemote = async () => {
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

    if (this.cacheService) {
      const cacheKey = this.cacheService.toCacheKey(type, url, JSON.stringify(data), JSON.stringify(params));
      const result = await this.cacheService.get(cacheKey, fetchFromRemote, cacheDuration || this.#duration);
      return result || fetchFromRemote();
    } else {
      return fetchFromRemote();
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

  static getIdentifier(): symbol {
    return Symbol.for('APRestClient');
  }

}
