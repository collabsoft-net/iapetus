
import { Condition, QueryBuilder as IQueryBuilder, WhereFilterOp } from '@collabsoft-net/types';

export class QueryBuilder implements IQueryBuilder {

  private _whereConditions: Array<Condition> = [];
  private _sortingConditions: Array<Condition> = [];
  private _limitConditions: Array<Condition> = [];

  get conditions(): Array<Condition> {
    return [
      ...this._whereConditions.slice(),
      ...this._sortingConditions.slice(),
      ...this._limitConditions.slice()
    ];
  }

  where(key: string, operator: WhereFilterOp, value: string|number|boolean|Array<unknown>): QueryBuilder {
    this._whereConditions.push({ key, operator, value });
    if (operator === '!=') {
      this._whereConditions.push({ key: 'orderBy', operator: 'asc', value: key });
    }
    return this;
  }

  orderBy(key: string, direction: 'asc'|'desc' = 'asc'): QueryBuilder {
    this._sortingConditions.push({ key: 'orderBy', operator: direction, value: key });
    return this;
  }

  limit(value: number, offset?: number): QueryBuilder {
    this._limitConditions.push({ key: 'limit', operator: '==', value });
    if (offset) {
      this._limitConditions.push({ key: 'offset', operator: '==', value: offset });
    }
    return this;
  }

  matches(item: Record<string, string|number|boolean|Array<unknown>>, condition: Condition): boolean {
    const prop = item[condition.key];
    const value = condition.value;

    switch (condition.operator) {
      case '<': return prop < value;
      case '<=': return prop <= value;
      case '==': return prop === value;
      case '>=': return prop >= value;
      case '>': return prop > value;
      case 'array-contains': return Array.isArray(prop) && prop.includes(value);
      default: return false;
    }
  }

  static getIdentifier(): symbol {
    return Symbol.for('QueryBuilder');
  }

}
