/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

export enum RestClientEndpoints {
  CREATE = '/:name',
  READ = '/:name/:id?',
  UPDATE = '/:name/:id',
  DELETE = '/:name/:id',
  LIST = '/:name'
}