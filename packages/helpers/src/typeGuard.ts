import { Type } from '@collabsoft-net/types';

export const isOfType = <T>(obj: T | unknown, property: keyof T): obj is T => {
    return typeof obj === 'object' && property in (obj as Record<string, unknown>);
};

export const isTypeOf = <T, X>(instanceOrType: Type<T>|T, type: Type<X>): boolean => {
    return (instanceOrType instanceof type || '' + instanceOrType === '' + type);
  }
