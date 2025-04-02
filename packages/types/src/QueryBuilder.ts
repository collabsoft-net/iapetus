import { Entity } from './Entity';

export interface QueryBuilder<T extends Entity> {

  get conditions(): Array<Condition<T>>;
  orderBy(key: keyof T, direction: 'asc'|'desc'): QueryBuilder<T>;
  where(key: keyof T, operator: WhereFilterOp, value: string|number|boolean|Array<unknown>): QueryBuilder<T>;
  limit(value: number, offset?: number): QueryBuilder<T>;
}

export interface Condition<T> {
  key: keyof T|'orderBy'|'limit'|'offset';
  operator: WhereFilterOp|'asc'|'desc';
  value: string|number|boolean|Array<unknown>;
}

export type WhereFilterOp = '<' | '<=' | '==' | '>=' | '>' | '!=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';