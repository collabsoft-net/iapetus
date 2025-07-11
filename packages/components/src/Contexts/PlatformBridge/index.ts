
import { Applications } from '@collabsoft-net/enums';
import kernel from '@collabsoft-net/inversify';
import { ServiceIdentifier } from '@collabsoft-net/platform';
import React from 'react';

export const PlatformBridge = React.createContext<Platform.Bridge<Applications>|null>(
  kernel.isBound(ServiceIdentifier.PlatformBridge)
    ? kernel.get<Platform.Bridge<Applications>>(ServiceIdentifier.PlatformBridge)
    : null
);