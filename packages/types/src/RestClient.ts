
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RestClient {
  cached(duration: number): RestClient;
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  post<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean | undefined>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  post<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean | undefined>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  put<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean | undefined>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  put<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean | undefined>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  patch<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean | undefined>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  patch<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean | undefined>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  delete<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean | undefined>, cacheDuration?: number): Promise<AxiosResponse<T>>;
  delete<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean | undefined>, config?: AxiosRequestConfig, cacheDuration?: number): Promise<AxiosResponse<T>>;
  head<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, cacheDuration?: number): Promise<AxiosResponse<T>>;
}
