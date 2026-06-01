import type { Type } from './Type';

export interface CachingService {
  has(key: string | Array<string>): Promise<boolean>;
  get<T>(key: string): Promise<T | null>;
  get<T>(key: string, loader: () => Promise<T>, forceRefresh?: boolean): Promise<T>;
  get<T>(key: string, loader: () => Promise<T>, expiresInSeconds?: number): Promise<T>;
  get<T>(key: string, loader: () => Promise<T>, expiresInSeconds?: number, forceRefresh?: boolean): Promise<T>;
  get<T>(type: Type<T>, key: string): Promise<T | null>;
  get<T>(type: Type<T>, key: string, loader: () => Promise<T>, forceRefresh?: boolean): Promise<T>;
  get<T>(type: Type<T>, key: string, loader: () => Promise<T>, expiresInSeconds?: number): Promise<T>;
  get<T>(type: Type<T>, key: string, loader: () => Promise<T>, expiresInSeconds?: number, forceRefresh?: boolean): Promise<T>;
  set<T>(key: string, data: T, expiresInSeconds: number, encrypt?: boolean): Promise<void>;
  flush(key: string | Array<string>): Promise<void>;
  flushAll(): Promise<void>;
  toCacheKey(...args: Array<string | number | boolean | undefined>): string;
}

export type CachingExpirationPolicy = 'expireAfterWrite'|'expireAfterAccess';