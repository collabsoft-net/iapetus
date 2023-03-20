
import { RestClientMethods } from '@collabsoft-net/enums';
import { CachingService, RestClient } from '@collabsoft-net/types';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

export abstract class AbstractRestClient implements RestClient {

  protected duration?: number;
  protected client: AxiosInstance;
  private signal = axios.CancelToken.source();

  constructor(protected baseURL: string, protected config: AxiosRequestConfig = {}, protected cacheService?: CachingService, cacheDuration?: number) {
    this.duration = cacheDuration;

    this.client = axios.create(Object.assign({}, config, {
      baseURL: baseURL,
      cancelToken: this.signal.token,
    }));
  }

  get abortController(): CancelTokenSource {
    return this.signal;
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
        if (typeof value === undefined || value === undefined || value === null) return;
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === 'string' && value === '') return;
        query[key] = value;
      });
    }
    return query;
  }

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>> {
    config = config || {};
    const headers = config.headers || {};
    headers['X-ExperimentalApi'] = 'opt-in';
    config.headers = headers;

    const fetchFromRemote = async () => this.client({
      ...config,
      method,
      url: endpoint,
      data,
      params
    });

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
