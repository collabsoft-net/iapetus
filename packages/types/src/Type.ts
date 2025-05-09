/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export interface Type<T> extends Function {
  new (...args: any[]): T;
}
