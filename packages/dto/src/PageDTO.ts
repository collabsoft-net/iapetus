import { Paginated } from '@collabsoft-net/types';

export class PageDTO<T> implements Paginated<T> {
  start: number;
  size: number;
  total: number;
  hidden: number;
  values: Array<T>;
  last: boolean;

  constructor(data: Paginated<T>, hidden?: number);
  constructor(data: Array<T>, hidden?: number);
  constructor(data: Paginated<T>|Array<T>, hidden = 0) {
    if (Array.isArray(data)) {
      this.start =  0;
      this.size =  data.length;
      this.total =  data.length;
      this.hidden = hidden;
      this.values = data || [];
      this.last =  true;
    } else {
      this.start = data.start;
      this.size = data.size;
      this.total = data.total;
      this.hidden = hidden;
      this.values = data.values;
      this.last = data.last;
    }
  }

}