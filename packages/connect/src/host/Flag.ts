import uniqid from 'uniqid';

import { Host } from '../Host';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowWithAJS = window as unknown as Window & { AJS: any };

const flags = new Map<string, AP.FlagInstance>();

export const FlagCreateEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const message = AC.toMessage<AP.FlagOptions>(event);
  const { originId, data: flagOptions } = message;
  const flagId = uniqid(originId);
  const instance = windowWithAJS.AJS.flag(flagOptions);
  flags.set(flagId, instance);
  AC.reply(event, flagId);
}

export const FlagCloseEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const message = AC.toMessage<{ flagId: string }>(event);
  const { flagId } = message.data || {};
  if (flagId) {
    const flagInstance = flags.get(flagId);
    if (flagInstance) {
      flagInstance.close();
    }
  }
}