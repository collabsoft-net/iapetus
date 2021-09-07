
export {};

declare global {

  /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
  interface Session {}

  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
  /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
    interface User extends Session {}
  }
}