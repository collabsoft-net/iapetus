
import { Applications } from '@collabsoft-net/enums';
import kernel from '@collabsoft-net/inversify';
import { ServiceIdentifier } from '@collabsoft-net/platform';
import { AbstractRestClientService } from '@collabsoft-net/services';
import React from 'react';

export const PlatformBridge = React.createContext<Platform.Bridge<Applications, AbstractRestClientService>|null>(
  kernel.isBound(ServiceIdentifier.PlatformBridge)
    ? kernel.get(ServiceIdentifier.PlatformBridge)
    : null
);