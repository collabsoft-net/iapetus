
import { RestClientMethods } from '@collabsoft-net/enums';
import { RestClient } from '@collabsoft-net/types';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

export abstract class AbstractRestClient implements RestClient {

  protected client: AxiosInstance;
  private signal = axios.CancelToken.source();
  protected baseURL: string;

  constructor(baseURL: string, config: AxiosRequestConfig = {}) {
    this.baseURL = baseURL;

    this.client = axios.create(Object.assign({}, config, {
      baseURL: baseURL,
      cancelToken: this.signal.token,
    }));
  }

  get abortController(): CancelTokenSource {
    return this.signal;
  }

  async get<T>(endpoint: string, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>(RestClientMethods.GET, endpoint, undefined, params, config);
  }

  async post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>(RestClientMethods.POST, endpoint, data, params, config);
  }

  async put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>(RestClientMethods.PUT, endpoint, data, params, config);
  }

  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>(RestClientMethods.PATCH, endpoint, data, params, config);
  }

  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>(RestClientMethods.DELETE, endpoint, data, params, config);
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

  protected async request<T>(method: RestClientMethods, endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    config = config || {};
    const headers = config.headers || {};
    headers['X-ExperimentalApi'] = 'opt-in';
    config.headers = headers;

    return await this.client({
      ...config,
      method,
      url: endpoint,
      data,
      params
    });
  }

}
