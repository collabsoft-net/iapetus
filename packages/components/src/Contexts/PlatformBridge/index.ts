
import { Applications } from '@collabsoft-net/enums';
import kernel from '@collabsoft-net/inversify';
import { ServiceIdentifier } from '@collabsoft-net/platform';
import { AbstractRestClientService } from '@collabsoft-net/services';
import React from 'react';

export const PlatformBridge = <T extends Applications, X extends AbstractRestClientService> () => React.createContext<Platform.Bridge<T, X>|null>(
  kernel.isBound(ServiceIdentifier.PlatformBridge)
    ? kernel.get<Platform.Bridge<T, X>>(ServiceIdentifier.PlatformBridge)
    : null
);