
import { RestClientMethods } from '@collabsoft-net/enums';
import { CachingService, RestClient } from '@collabsoft-net/types';
import { requestBitbucket,requestConfluence, requestJira } from '@forge/bridge';
import { AxiosRequestConfig,AxiosResponse } from 'axios';

export abstract class AbstractRestClient implements RestClient {

  protected duration?: number;

  constructor(protected product: 'jira'|'confluence'|'bitbucket', protected cacheService?: CachingService, cacheDuration?: number) {
    this.duration = cacheDuration;
  }

  async get<T>(endpoint: string, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async get<T>(endpoint: string, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async get<T>(endpoint: string, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration !== 'number' ? configOrCacheDuration : undefined;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration
    return this.request<T>(RestClientMethods.GET, endpoint, undefined, params, config, duration);
  }

  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration !== 'number' ? configOrCacheDuration : undefined;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration
    return this.request<T>(RestClientMethods.POST, endpoint, data, params, config, duration);
  }

  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration !== 'number' ? configOrCacheDuration : undefined;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration
    return this.request<T>(RestClientMethods.PUT, endpoint, data, params, config, duration);
  }

  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration !== 'number' ? configOrCacheDuration : undefined;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration
    return this.request<T>(RestClientMethods.PATCH, endpoint, data, params, config, duration);
  }

  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration !== 'number' ? configOrCacheDuration : undefined;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration
    return this.request<T>(RestClientMethods.DELETE, endpoint, data, params, config, duration);
  }

  async head<T>(endpoint: string, params?: Record<string, string|number|boolean>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async head<T>(endpoint: string, params?: Record<string, string|number|boolean>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async head<T>(endpoint: string, params?: Record<string, string|number|boolean>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration !== 'number' ? configOrCacheDuration : undefined;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration
    return this.request<T>(RestClientMethods.HEAD, endpoint, undefined, params, config, duration);
  }

  protected normalizeQuery(params: Record<string, string|number|boolean|undefined>): Record<string, string|number|boolean|undefined> {
    const query: Record<string, string|number|boolean|undefined> = {};
    if (params) {
      Object.entries(params).forEach(([ key, value ]) => {
        if (typeof value === 'undefined' || value === undefined || value === null) return;
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === 'string' && value === '') return;
        query[key] = value;
      });
    }
    return query;
  }

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>> {
    // Get the right Fetch implementation based on the product
    const client = this.product === 'jira' ? requestJira : this.product === 'confluence' ? requestConfluence : requestBitbucket;

    // Placeholder for the request headers
    const headers = {} as Record<string, string>;

    // Convert the Axios request config
    if (config?.headers) {
      Object.entries(config.headers).forEach(([key, value]) => headers[key] = value);
    }

    // Add the experimental API header by default
    headers['X-ExperimentalApi'] = 'opt-in';

    const body = (data || config?.data || null) as BodyInit|null;

    const fetchFromRemote = async () => client(endpoint, {
      method,
      headers,
      body
    }).catch(response => response.json());

    if (this.cacheService) {
      try {
        const cacheKey = this.cacheService.toCacheKey(method, endpoint, JSON.stringify(data), JSON.stringify(params), JSON.stringify(config?.headers || {}));
        const result = await this.cacheService.get(cacheKey, fetchFromRemote, cacheDuration || this.duration);
        return result || fetchFromRemote();
      } catch (err) {
        return fetchFromRemote();
      }
    } else {
      return fetchFromRemote();
    }
  }

  abstract cached(duration: number): AbstractRestClient;
}
