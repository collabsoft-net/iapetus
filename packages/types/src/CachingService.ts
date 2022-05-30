import { Type } from './Type';

export interface CachingService {
  has(key: string|Array<string>): Promise<boolean>;
  get<T>(key: string): Promise<T|null>;
  get<T>(key: string, loader: () => Promise<T|null>, forceRefresh?: boolean): Promise<T|null>;
  get<T>(type: Type<T>, key: string): Promise<T|null>;
  get<T>(type: Type<T>, key: string, loader: () => Promise<T|null>, forceRefresh?: boolean): Promise<T|null>;
  set<T>(key: string, data: T, expiresInSeconds: number): Promise<Error|null>;
  flush(key: string|Array<string>): Promise<void>;
  flushAll(): Promise<void>;
  toCacheKey(...args: Array<string|number|boolean|undefined>): string;
}