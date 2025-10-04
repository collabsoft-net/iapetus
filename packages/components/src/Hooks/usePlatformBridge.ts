
import { Applications } from '@collabsoft-net/enums';
import { ServiceIdentifier } from '@collabsoft-net/platform';
import { AbstractRestClientService } from '@collabsoft-net/services';

import { PlatformBridge as context } from '../Contexts/PlatformBridge';
import { useContext } from './useContext';

export const usePlatformBridge = <T extends Applications, X extends AbstractRestClientService> (): Platform.Bridge<T, X>  => {
  const bridge = useContext(context, ServiceIdentifier.PlatformBridge)
  if (bridge) {
    return bridge as Platform.Bridge<T, X>;
  }

  throw new Error(`Unable to detect Platform bridge. Please make sure to initialize it and bind it to ${ServiceIdentifier.PlatformBridge.toString()}`)
}
