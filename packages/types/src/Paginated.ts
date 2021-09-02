
export interface Paginated<T> {
  start: number;
  size: number;
  total: number;
  values: Array<T>;
  last: boolean;
}