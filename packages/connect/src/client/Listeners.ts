import { CallbackHandler } from './Types';

export const responseListeners = new Map<string, CallbackHandler<never>>();

export const eventListeners = new Map<CallbackHandler<never>, {
  name: string;
  once?: boolean;
  listener: CallbackHandler<never>,
  filter?: (addonKey: string, key: string) => boolean
}|undefined>();
