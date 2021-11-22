
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RestClient {
  get<T>(endpoint: string, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  patch<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}
