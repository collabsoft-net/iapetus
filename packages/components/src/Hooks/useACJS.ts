import { ServiceIdentifier, WindowWithAP } from '@collabsoft-net/connect';
import { isOfType } from '@collabsoft-net/helpers';

import { AP } from '../Contexts/AP';
import { useContext } from './useContext';

export const useACJS = <T extends AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance> () => {
  if (isOfType<WindowWithAP>(window, 'AP')) {
    return window.AP as T;
  } else {
    const ACJS = useContext<AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance>(AP, ServiceIdentifier.AP);
    return ACJS as T;
  }
}