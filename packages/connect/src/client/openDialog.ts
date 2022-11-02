
import { ServiceIdentifier } from '@collabsoft-net/connect';
import { isOfType } from '@collabsoft-net/helpers';
import kernel from '@collabsoft-net/inversify';

type DialogCallback<T> = (data?: T) => void;

const generateDialogOptions = <T, X> (key: string, optionsOrDataOrCallback?: AP.DialogOptions<X>|X|DialogCallback<T>): AP.DialogOptions<X> => {
  const defaultOptions = kernel.get<AP.DialogOptions<X>>(key) || {};

  if (typeof optionsOrDataOrCallback === 'function') {
    return { ...defaultOptions, key };
  } else {
    const options: AP.DialogOptions<X>|undefined = isOfType<AP.DialogOptions<X>>(optionsOrDataOrCallback, 'key') && optionsOrDataOrCallback.key === key ? optionsOrDataOrCallback : undefined;
    const customData: X|undefined = !isOfType<AP.DialogOptions<X>>(optionsOrDataOrCallback, 'key') || optionsOrDataOrCallback.key !== key ? optionsOrDataOrCallback as X : undefined;

    if (options) {
      return { ...defaultOptions, ...options, customData: options.customData || customData };
    } else {
      return { ...defaultOptions, key, customData };
    }
  }
}

export function openDialog<T>(key: string): Promise<T>;
export function openDialog<T>(key: string, callback: DialogCallback<T>): Promise<T>;
export function openDialog<T, X>(key: string, customData: X): Promise<T>;
export function openDialog<T, X>(key: string, customData: X, callback: DialogCallback<T>): Promise<T>;
export function openDialog<T, X>(key: string, options: AP.DialogOptions<X>): Promise<T>;
export function openDialog<T, X>(key: string, options: AP.DialogOptions<X>, callback: DialogCallback<T>): Promise<T>;
export function openDialog<T, X>(key: string, optionsOrDataOrCallback?: AP.DialogOptions<X>|X|DialogCallback<T>, callback?: DialogCallback<T>): Promise<T|undefined> {
  const AP = kernel.get<AP.Instance>(ServiceIdentifier.AP);
  if (AP) {
    return new Promise<T|undefined>(resolve => AP.dialog.create<X>(generateDialogOptions(key, optionsOrDataOrCallback)).on<T>('close', (data?: T) => {
      callback && callback(data);
      resolve(data);
    }));
  } else {
    throw new Error(`Failed to retrieve required object 'AP' using service identifier '${String(ServiceIdentifier.AP)}'`);
  }
}