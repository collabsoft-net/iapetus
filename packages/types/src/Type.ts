/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

export interface Type<T> extends Function {
  new (...args: any[]): T;
}
