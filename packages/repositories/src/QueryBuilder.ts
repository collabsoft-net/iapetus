
import { Condition, QueryBuilder as IQueryBuilder, WhereFilterOp } from '@collabsoft-net/types';

export class QueryBuilder implements IQueryBuilder {

  private _conditions: Array<Condition> = [];

  get conditions(): Array<Condition> {
    return this._conditions.slice();
  }

  orderBy(key: string, direction: 'asc'|'desc' = 'asc'): QueryBuilder {
    this._conditions.push({ key: 'orderBy', operator: direction, value: key });
    return this;
  }

  where(key: string, operator: WhereFilterOp, value: string|number|boolean|Array<unknown>): QueryBuilder {
    this._conditions.push({ key, operator, value });
    return this;
  }

  limit(value: number, offset?: number): QueryBuilder {
    this._conditions.push({ key: 'limit', operator: '==', value });
    if (offset) {
      this._conditions.push({ key: 'offset', operator: '==', value: offset });
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
      case 'in': return Array.isArray(value) && value.includes(prop);
      default: return false;
    }
  }

  static getIdentifier(): symbol {
    return Symbol.for('QueryBuilder');
  }

}
