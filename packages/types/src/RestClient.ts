
import { AxiosResponse } from 'axios';

export interface RestClient {
  get<T>(endpoint: string, params?: Record<string, string|number|boolean|undefined>): Promise<AxiosResponse<T>>;
  post<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>): Promise<AxiosResponse<T>>;
  put<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>): Promise<AxiosResponse<T>>;
  delete<T>(endpoint: string, data?: unknown, params?: Record<string, string|number|boolean|undefined>): Promise<AxiosResponse<T>>;
}
