
import { RestClientMethods } from '@collabsoft-net/enums';
import { CachingService, RestClient } from '@collabsoft-net/types';
import { AxiosError, AxiosHeaders, AxiosRequestConfig,AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { invoke, invokeRemote } from '@forge/bridge';
import { isOfType } from '@collabsoft-net/helpers';

export class ForgeInvokeClient implements RestClient {

  protected name?: string;
  protected cacheService?: CachingService;
  protected duration?: number;

  constructor(type: 'native', name: string, cacheService?: CachingService, cacheDuration?: number);
  constructor(type: 'remote', cacheService?: CachingService, cacheDuration?: number);
  constructor(protected type: 'native'|'remote', nameOrCacheService?: string|CachingService, cacheServiceOrDuration?: CachingService|number, cacheDuration?: number) {
    this.name = typeof nameOrCacheService === 'string' ? nameOrCacheService : undefined;
    this.cacheService = typeof nameOrCacheService !== 'string' ? nameOrCacheService : typeof cacheServiceOrDuration !== 'number' ? cacheServiceOrDuration : undefined;
    this.duration = typeof cacheServiceOrDuration === 'number' ? cacheServiceOrDuration : cacheDuration;
  }

  cached(cacheService: CachingService, duration: number) {
    return this.type === 'native' 
      ? new ForgeInvokeClient(this.type, this.name as string, cacheService, duration)
      : new ForgeInvokeClient(this.type, cacheService, duration);
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


    const fetchFromRemote = async (): Promise<AxiosResponse<T>> => {

      // Turn the parameters into a proper querystring
      const querystring: Record<string, string> = {};
      Object.entries(params || {}).forEach(([ key, value ]) => querystring[key] = String(value));
      const query = new URLSearchParams(querystring);

      // Add the parameters to the endpoint as this is part of the request
      const path = Object.keys(querystring).length > 0 ? `${endpoint}?${query.toString()}` : endpoint;

      const headers: Record<string, string> = {};
      Object.entries(config?.headers || {}).forEach(([ key, value ]) => headers[String(key)] = String(value));

      const invocation = typeof this.name === 'string'
        ? invoke(this.name, { method, path, data, params, headers }) 
        : invokeRemote({
          path,
          method: (method === RestClientMethods.HEAD ? 'GET' : method.toUpperCase()) as 'GET'|'POST'|'PUT'|'PATCH'|'DELETE',
          body: data,
          headers
        });

      return invocation
        .then(response => this.toAxiosResponse<T>(response as T))
        .catch(err => {
          if (isOfType<Error>(err, 'message')) {
            throw new AxiosError<T>(err.message);
          } else {
            throw new AxiosError<T>('An unknown error occurred');
          }
        });
    }

    if (this.cacheService) {
      try {
        const cacheKey = this.cacheService.toCacheKey(method, endpoint, JSON.stringify(data), JSON.stringify(params), JSON.stringify(config?.headers || {}));

        const result = await this.cacheService.get(cacheKey, {
          loader: fetchFromRemote, 
          expiresInSeconds: cacheDuration || this.duration
        });

        return result || await fetchFromRemote();
      } catch (err) {
        return fetchFromRemote();
      }
    } else {
      return fetchFromRemote();
    }
  }

  private toAxiosResponse<T>(response: T, config?: AxiosRequestConfig): AxiosResponse<T> {
    // We need to make sure we check multiple properties as the response object is not documented
    let data = isOfType(response, 'data')
      ? response.data
      : (isOfType(response, 'body'))
        ? response.body
        : response;

    try {
      data = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {}

    return {
      data,
      status: isOfType(response, 'status') ? response.status : 200,
      statusText: isOfType(response, 'statusText') ? response.statusText : 'OK',
      headers: isOfType(response, 'headers') ? response.headers : {},
      config: this.toInternalAxiosRequestConfig(config)
    };
  }

  private toInternalAxiosRequestConfig(config?: AxiosRequestConfig): InternalAxiosRequestConfig {
    const requestHeaders = {} as Record<string, string>;
    Object.entries(config?.headers || {}).forEach(([key, value]) => requestHeaders[key] = value);
    return {
      ...config,
      headers: new AxiosHeaders(requestHeaders)
    };
  }

}
