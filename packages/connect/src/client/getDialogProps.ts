import kernel from '@collabsoft-net/inversify';
import { Props } from '@collabsoft-net/types';

import { ServiceIdentifier } from '../ServiceIdentifier';

export const getDialogProps = async () => {
  const AP = kernel.get<AP.Instance>(ServiceIdentifier.AP);
  return new Promise<Props>(resolve => AP.dialog.getCustomData<Props>(resolve));
};