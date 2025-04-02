
import { Condition, Entity, QueryBuilder as IQueryBuilder, WhereFilterOp } from '@collabsoft-net/types';

export class QueryBuilder<T extends Entity> implements IQueryBuilder<T> {

  private _whereConditions: Array<Condition<T>> = [];
  private _sortingConditions: Array<Condition<T>> = [];
  private _limitConditions: Array<Condition<T>> = [];

  get conditions(): Array<Condition<T>> {
    return [
      ...this._whereConditions.slice(),
      ...this._sortingConditions.slice(),
      ...this._limitConditions.slice()
    ];
  }

  where(key: keyof T, operator: WhereFilterOp, value: string|number|boolean|Array<unknown>): QueryBuilder<T> {
    this._whereConditions.push({ key: String(key), operator, value });
    return this;
  }

  orderBy(key: keyof T, direction: 'asc'|'desc' = 'asc'): QueryBuilder<T> {
    this._sortingConditions.push({ key: 'orderBy', operator: direction, value: typeof key === 'symbol' ? key.toString() : key });
    return this;
  }

  limit(value: number, offset?: number): QueryBuilder<T> {
    this._limitConditions.push({ key: 'limit', operator: '==', value });
    if (offset) {
      this._limitConditions.push({ key: 'offset', operator: '==', value: offset });
    }
    return this;
  }

  matches(item: Record<keyof T, string|number|boolean|Array<unknown>>, condition: Condition<T>): boolean {
    const prop = item[condition.key];
    const value = condition.value;

    switch (condition.operator) {
      case '<': return prop < value;
      case '<=': return prop <= value;
      case '==': return prop === value;
      case '>=': return prop >= value;
      case '>': return prop > value;
      case '!=': return prop != value;
      case 'array-contains': return Array.isArray(prop) && prop.includes(value);
      default: return false;
    }
  }

  static getIdentifier(): symbol {
    return Symbol.for('QueryBuilder');
  }

}
