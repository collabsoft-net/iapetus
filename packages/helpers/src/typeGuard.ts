import { Type } from '@collabsoft-net/types';

export function isOfType <T>(obj: T | unknown, property: keyof T): obj is T;
export function isOfType <T>(obj: T | unknown, property: keyof T, value: unknown): obj is T;
export function isOfType <T>(obj: T | unknown, property: keyof T, value?: unknown): obj is T {
  return !value
    ? obj !== null && typeof obj === 'object' && property in (obj as Record<string, unknown>)
    : obj !== null && typeof obj === 'object' && property in (obj as Record<string, unknown>) && (obj as Record<keyof T, unknown>)[property] === value;
};

export const isTypeOf = <T, X>(instanceOrType: Type<T>|T, type: Type<X>): boolean => {
  return (instanceOrType instanceof type || '' + instanceOrType === '' + type);
}
