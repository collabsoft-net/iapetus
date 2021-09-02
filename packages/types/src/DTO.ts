
export class DTO implements Record<string, unknown> {

  id?: string;
  [key: string]: unknown;

  constructor(id?: string) {
    this.id = id;
  }

}