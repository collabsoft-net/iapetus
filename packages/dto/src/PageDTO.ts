import { Paginated } from '@collabsoft-net/types';

export class PageDTO<T> implements Paginated<T> {
  start: number;
  size: number;
  total: number;
  values: Array<T>;
  last: boolean;

  constructor(data: Array<T>) {
    this.last =  true,
    this.size =  data.length,
    this.total =  data.length,
    this.start =  0,
    this.values = data || [];
  }

}