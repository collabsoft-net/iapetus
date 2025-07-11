
import { Applications } from '@collabsoft-net/enums';
import { ServiceIdentifier } from '@collabsoft-net/platform';

import { PlatformBridge as context } from '../Contexts/PlatformBridge';
import { useContext } from './useContext';

export const usePlatformBridge = (): Platform.Bridge<Applications>  => {
  const bridge = useContext(context, ServiceIdentifier.PlatformBridge)
  if (bridge) {
    return bridge
  }

  throw new Error(`Unable to detect Platform bridge. Please make sure to initialize it and bind it to ${ServiceIdentifier.PlatformBridge.toString()}`)
}
