/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

export enum RestClientEndpoints {
  TOKEN_EXCHANGE = '/.well-known/token-exchange.json',
  CREATE = '/:name',
  READ = '/:name{/:id}',
  UPDATE = '/:name/:id',
  DELETE = '/:name/:id',
  LIST = '/:name'
}