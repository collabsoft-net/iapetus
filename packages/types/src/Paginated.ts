
export interface Paginated<T> {
  start: number;
  size: number;
  total: number;
  hidden?: number;
  values: Array<T>;
  last: boolean;
}