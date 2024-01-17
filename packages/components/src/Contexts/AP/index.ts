
import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import React from 'react';

const windowWithAP = window as unknown as Window & { AP: AP.PlatformInstance };

export const AP = React.createContext<AP.PlatformInstance|null>(
  windowWithAP.AP
    ? windowWithAP.AP
    : kernel.isBound(ServiceIdentifier.AP)
      ? kernel.get<AP.PlatformInstance>(ServiceIdentifier.AP)
      : null
);