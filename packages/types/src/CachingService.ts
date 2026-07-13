import type { Type } from './Type';

export interface CachingService {
  has(key: string | Array<string>): Promise<boolean>;
  get<T>(key: string): Promise<T | null>;
  get<T>(key: string, options: CacheOptionsWithLoader<T>): Promise<T | null>;
  get<T>(key: string, loader: () => Promise<T>): Promise<T>;
  get<T>(key: string, loader: () => Promise<T>, options: CacheOptions): Promise<T>;
  get<T>(key: string, loader: () => Promise<T>, forceRefresh: boolean): Promise<T>;
  get<T>(key: string, loader: () => Promise<T>, forceRefresh: boolean, options: CacheOptions): Promise<T>;
  get<T>(type: Type<T>, key: string): Promise<T | null>;
  get<T>(type: Type<T>, key: string, options: CacheOptionsWithLoader<T>): Promise<T | null>;
  get<T>(type: Type<T>, key: string, loader: () => Promise<T>): Promise<T>;
  get<T>(type: Type<T>, key: string, loader: () => Promise<T>, options: CacheOptions): Promise<T>;
  get<T>(type: Type<T>, key: string, loader: () => Promise<T>, forceRefresh: boolean): Promise<T>;
  get<T>(type: Type<T>, key: string, loader: () => Promise<T>, forceRefresh: boolean, options: CacheOptions): Promise<T>;
  set<T>(key: string, data: T, expiresInSeconds: number): Promise<void>;
  set<T>(key: string, data: T, options?: CacheOptions): Promise<void>;
  flush(key: string | Array<string>): Promise<void>;
  flushAll(): Promise<void>;
  toCacheKey(...args: Array<string | number | boolean | undefined>): string;
}

export type CacheOptions = {
  expiresInSeconds?: number;
  expirationPolicy?: CachingExpirationPolicy;
  encrypt?: boolean;
}

export type CacheOptionsWithLoader<T> = CacheOptions & {
  forceRefresh?: boolean;
  loader: () => Promise<T>;
}

export type CachingExpirationPolicy = 'expireAfterWrite'|'expireAfterAccess';