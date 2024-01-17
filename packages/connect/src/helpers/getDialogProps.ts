import kernel from '@collabsoft-net/inversify';
import { Props } from '@collabsoft-net/types';

import { ServiceIdentifier } from '../ServiceIdentifier';

export const getDialogProps = async () => {
  const AP = kernel.get<AP.PlatformInstance>(ServiceIdentifier.AP);
  return new Promise<Props|undefined>(resolve => AP.dialog.getCustomData<Props>(resolve));
};