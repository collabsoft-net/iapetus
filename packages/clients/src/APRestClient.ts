import { RestClientMethods } from '@collabsoft-net/enums';
import { isNullOrEmpty, isOfType } from '@collabsoft-net/helpers';
import { CachingService, RestClient } from '@collabsoft-net/types';
import { AxiosHeaders, AxiosRequestConfig, AxiosResponse, RawAxiosResponseHeaders } from 'axios';

export class APRestClient implements RestClient {

  #duration?: number;

  constructor(protected AP: AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance, private cacheService?: CachingService) {}

  cached(cacheService: CachingService, duration: number): APRestClient {
    const instance = new APRestClient(this.AP, cacheService);
    instance.#duration = duration;
    return instance;
  }

  protected get client(): Promise<AP.Request> {
    const AP = this.AP;
    if (isOfType<AP.PlatformInstance>(AP, 'request')) {
      return new Promise(resolve => resolve(AP.request));
    } else if (isOfType<AP.BitbucketInstance>(AP, 'require')) {
      return new Promise(resolve => AP.require('request', resolve));
    } else {
      throw new Error(`Provided instance of AP does not support '.request()'`);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async get<T>(endpoint: string, params?: Record<string, string>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async get<T>(endpoint: string, params?: Record<string, string>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration === 'number' ? undefined : configOrCacheDuration;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.GET, endpoint, undefined, params, config, duration);
  }

  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration === 'number' ? undefined : configOrCacheDuration;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.POST, endpoint, data, params, config, duration);
  }

  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration === 'number' ? undefined : configOrCacheDuration;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.PUT, endpoint, data, params, config, duration);
  }

  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration === 'number' ? undefined : configOrCacheDuration;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.PATCH, endpoint, data, params, config, duration);
  }

  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration === 'number' ? undefined : configOrCacheDuration;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.DELETE, endpoint, data, params, config, duration);
  }

  async head<T>(endpoint: string, params?: Record<string, string>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async head<T>(endpoint: string, params?: Record<string, string>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  async head<T>(endpoint: string, params?: Record<string, string>, configOrCacheDuration?: AxiosRequestConfig|number, cacheDuration?: number): Promise<AxiosResponse<T>> {
    const config = typeof configOrCacheDuration === 'number' ? undefined : configOrCacheDuration;
    const duration = typeof configOrCacheDuration === 'number' ? configOrCacheDuration : cacheDuration;
    return this.request(RestClientMethods.HEAD, endpoint, undefined, params, config, duration);
  }

  protected async request<T>(type: string, url: string, data: unknown, params?: Record<string, string>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>> {
    if (this.cacheService) {
      const cacheKey = this.cacheService.toCacheKey(type, url, JSON.stringify(data), JSON.stringify(params));
      const result = await this.cacheService.get(cacheKey, {
        loader: () => this.fetchFromRemote<T>(type, url, data, params, config),
        expiresInSeconds: cacheDuration || this.#duration
      });
      return result || this.fetchFromRemote<T>(type, url, data, params, config);
    } else {
      return this.fetchFromRemote<T>(type, url, data, params, config);
    }
  }

  protected getUrl(endpoint: string, params?: Record<string, string>): string {
    if (params) {
      const querystring = new URLSearchParams(this.normalizeQuery(params));
      endpoint = `${endpoint}?${querystring.toString()}`;
    }

    return endpoint;
  }

  protected normalizeQuery(params: Record<string, string|undefined>): Record<string, string> {
    const query: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([ key, value ]) => {
        if (isNullOrEmpty(value)) return;
        query[key] = value;
      });
    }
    return query;
  }

  protected getHeaders(xhr: AP.RequestResponseXHRObject): RawAxiosResponseHeaders {
    const result: RawAxiosResponseHeaders = {};
    if (typeof xhr.getAllResponseHeaders === 'function') {
      const headers = xhr.getAllResponseHeaders().split('\r\n');
      headers.forEach(item => {
        const [ name, ...value ] = item.split(':');
        result[name] = value.join(';');
      });
    }
    return result;
  }

  private async fetchFromRemote<T>(type: string, url: string, data: unknown, params?: Record<string, string>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const client = await this.client;

      // The Bitbucket implementation of AP.request is different from other hosts
      // So we need to have a different fetch mechanism
      if (isOfType<AP.BitbucketInstance>(this.AP, 'bitbucket')) {
        return this.fetchFromBitbucket(type, url, data, params, config);
      } else {

        // Retrieve settings from config (if available)
        data = data || config?.data;
        const binaryAttachment = config?.responseType === 'arraybuffer';
        const headers: Record<string, string> = {};
        Object.entries(config?.headers || {}).forEach(([ key, value ]) => { headers[key] = value; });

        const { body, xhr } = await client({
          type,
          url: this.getUrl(url, params),
          data: data ? JSON.stringify(data) : undefined,
          headers,
          contentType: 'application/json',
          experimental: true,
          binaryAttachment
        });

        let result;
        try {
          result = JSON.parse(body)
        } catch (_ignored) {
          result = body;
        }

        return {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: this.getHeaders(xhr),
          config: {
            headers: new AxiosHeaders()
          },
          data: result
        };
      }
    } catch (error) {
      if (isOfType<AP.RequestResponseError>(error, 'xhr')) {
        const { err, xhr } = error as AP.RequestResponseError;
        return {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: this.getHeaders(xhr),
          config: {
            headers: new AxiosHeaders()
          },
            data: err as unknown as T
        };
      } else {
        return {
          status: 500,
          statusText: '',
          headers: {},
          config: {
            headers: new AxiosHeaders()
          },
            data: error as unknown as T
        };
      }
    }
  }

  private async fetchFromBitbucket<T>(type: string, url: string, data: unknown, params?: Record<string, string>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const client = await this.client;

    // Retrieve settings from config (if available)
    data = data || config?.data;
    const binaryAttachment = config?.responseType === 'arraybuffer';
    const headers: Record<string, string> = {};
    Object.entries(config?.headers || {}).forEach(([ key, value ]) => { headers[key] = value; });

    const result = await new Promise<T>((resolve, reject) => client({
      type,
      url: this.getUrl(url, params),
      data: data ? JSON.stringify(data) : undefined,
      headers,
      contentType: 'application/json',
      experimental: true,
      binaryAttachment,
      success: async (responseText: string) => {
        const data: T = typeof responseText === 'string' ? JSON.parse(responseText) : responseText as unknown as T;
        resolve(data);
      },
      error: reject
    }));

    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders()
      },
      data: result
    };
  }

  static getIdentifier(): symbol {
    return Symbol.for('APRestClient');
  }

}
