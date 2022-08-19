import { Paginated } from '@collabsoft-net/types';

export class PageDTO<T> implements Paginated<T> {
  start: number;
  size: number;
  total: number;
  hidden: number;
  values: Array<T>;
  last: boolean;

  constructor(data: Array<T>, hidden = 0) {
    this.start =  0;
    this.size =  data.length;
    this.total =  data.length;
    this.hidden = hidden;
    this.values = data || [];
    this.last =  true;
  }

}