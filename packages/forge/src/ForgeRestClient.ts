
import { Applications, RestClientMethods } from '@collabsoft-net/enums';
import { CachingService, RestClient } from '@collabsoft-net/types';
import { requestBitbucket,requestConfluence, requestJira } from '@forge/bridge';
import { AxiosError, AxiosHeaders, AxiosRequestConfig,AxiosResponse, InternalAxiosRequestConfig, RawAxiosResponseHeaders } from 'axios';
import { isOfType } from '@collabsoft-net/helpers';

export class ForgeRestClient implements RestClient {

  protected duration?: number;

  constructor(protected product: Applications, protected cacheService?: CachingService, cacheDuration?: number) {
    if (product === Applications.BAMBOO) {
      throw new Error('Atlassian Bamboo is not supported by Atlassian Forge');
    }

    this.duration = cacheDuration;
  }

  cached(cacheService: CachingService, duration: number) {
    return new ForgeRestClient(this.product, cacheService, duration);
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

  protected normalizeQuery(params: Record<string, string|number|boolean|undefined>): Record<string, string> {
    const query: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([ key, value ]) => {
        if (typeof value === 'undefined' || value === undefined || value === null) return;
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === 'string' && value === '') return;
        query[key] = String(value);
      });
    }
    return query;
  }

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>> {
    // Get the right Fetch implementation based on the product
    const client = this.product === 'jira' ? requestJira : this.product === 'confluence' ? requestConfluence : requestBitbucket;

    // Placeholder for the request headers
    const headers = {
      'Content-Type': 'application/json'
    } as Record<string, string>;

    // Convert the Axios request config
    if (config?.headers) {
      Object.entries(config.headers).forEach(([key, value]) => headers[key] = value);
    }

    // Add the experimental API header by default
    headers['X-ExperimentalApi'] = 'opt-in';

    // JSON stringify any data that is going to be sent in the body
    // The body should be empty for GET and HEAD requests
    const body = 
      method === RestClientMethods.GET || method === RestClientMethods.HEAD
        ? undefined
        : data || config?.data ? JSON.stringify(data || config?.data) : null;

    // We need to add query parameters to the URL, as fetch RequestInit does not have a separate property for it
    const query = params ? new URLSearchParams(this.normalizeQuery(params)) : null;
    const url = query ? `${endpoint}?${query.toString()}` : endpoint;

    const fetchFromRemote = async (): Promise<AxiosResponse<T>> => client(url, { method, headers, body })
      .then(response => this.toAxiosResponse<T>(response))
      .catch(err => {
        if (isOfType<Response>(err, 'status')) {
          throw new AxiosError<T>(err.statusText, String(err.status), this.toInternalAxiosRequestConfig(config), this.toAxiosResponse<T>(err))
        } else if (isOfType<Error>(err, 'message')) {
          throw new AxiosError<T>(err.message);
        } else {
          throw new AxiosError<T>('An unknown error occurred');
        }
      });

    if (this.cacheService) {
      try {
        const cacheKey = this.cacheService.toCacheKey(method, endpoint, JSON.stringify(data), JSON.stringify(params), JSON.stringify(config?.headers || {}));
        const result = await this.cacheService.get(cacheKey, fetchFromRemote, cacheDuration || this.duration);
        return result || await fetchFromRemote();
      } catch (err) {
        return fetchFromRemote();
      }
    } else {
      return fetchFromRemote();
    }
  }

  private async toAxiosResponse<T>(response: Response, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const responseHeaders: RawAxiosResponseHeaders = {};
    response.headers.forEach((value, key) => responseHeaders[key] = value);        

    const result: AxiosResponse<T> = {
      data: await response.json() as T,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      config: this.toInternalAxiosRequestConfig(config)
    };

    return result;
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
