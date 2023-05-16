import kernel from '@collabsoft-net/inversify';

import { ServiceIdentifier } from '../ServiceIdentifier';

const flags = new Map<string, AP.FlagInstance>();

export function showFlag(title: string): AP.FlagInstance;
export function showFlag(title: string, type: AP.FlagTypeOptions): AP.FlagInstance;
export function showFlag(title: string, type: AP.FlagTypeOptions, body: string): AP.FlagInstance;
export function showFlag(options: AP.FlagOptions): AP.FlagInstance;
export function showFlag(titleOrOptions: string|AP.FlagOptions, type?: AP.FlagTypeOptions, body?: string): AP.FlagInstance {
  const AP = kernel.get<AP.Instance>(ServiceIdentifier.AP);
  if (AP) {
    const flagOptions: AP.FlagOptions = typeof titleOrOptions !== 'string' ? titleOrOptions : {
      title: titleOrOptions,
      body: body || '',
      type: type || 'info',
      close: 'auto'
    };

    const flag = AP.flag.create(flagOptions);
    flags.set(flag._id, flag);
    return flag;
  } else {
    throw new Error(`Failed to retrieve required object 'AP' using service identifier '${String(ServiceIdentifier.AP)}'`);
  }
}

export function closeFlag(flagId: string) {
  const flag = flags.get(flagId);
  if (flag) {
    flag.close();
    flags.delete(flagId);
  }
}