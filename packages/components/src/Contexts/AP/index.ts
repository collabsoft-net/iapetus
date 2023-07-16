
import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import React from 'react';

const windowWithAP = window as unknown as Window & { AP: AP.Instance };

export const AP = React.createContext<AP.Instance|null>(
  windowWithAP.AP
    ? windowWithAP.AP
    : kernel.isBound(ServiceIdentifier.AP)
      ? kernel.get<AP.Instance>(ServiceIdentifier.AP)
      : null
);