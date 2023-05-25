import kernel from '@collabsoft-net/inversify';
import { Props } from '@collabsoft-net/types';

import { ServiceIdentifier } from '../ServiceIdentifier';

export const getMacroDataProps = async () => {
  const AP = kernel.get<AP.Instance>(ServiceIdentifier.AP);
  return AP.confluence ? new Promise<Props>(resolve => AP.confluence.getMacroData(resolve)) : {};
};
