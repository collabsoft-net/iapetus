import { isOfType } from '@collabsoft-net/helpers';
import kernel from '@collabsoft-net/inversify';
import { Props } from '@collabsoft-net/types';

import { ServiceIdentifier } from '../ServiceIdentifier';

export const getMacroDataProps = async () => {
  const AP = kernel.get<AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance>(ServiceIdentifier.AP);
  return new Promise<Props|undefined>(resolve =>
    isOfType<AP.ConfluenceInstance>(AP, 'confluence')
      ? AP.confluence.getMacroData(resolve)
      : resolve({}));
};
