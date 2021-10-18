
export interface QueryBuilder {

  get conditions(): Array<Condition>;
  orderBy(key: string, direction: 'asc'|'desc'): QueryBuilder;
  where(key: string, operator: WhereFilterOp, value: string|number|boolean|Array<unknown>): QueryBuilder;
  limit(value: number, offset?: number): QueryBuilder;
  matches(item: Record<string, string|number|boolean|Array<unknown>>, condition: Condition): boolean;
}

export interface Condition {
  key: string;
  operator: string;
  value: string|number|boolean|Array<unknown>;
}

export type WhereFilterOp = '<' | '<=' | '==' | '>=' | '>' | '!=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';