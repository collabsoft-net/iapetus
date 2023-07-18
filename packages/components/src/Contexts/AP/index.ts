
import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import React from 'react';

const windowWithAP = window as unknown as Window & { AP: AP.Instance };

export const AP = React.createContext<AP.Instance>(
  windowWithAP.AP
    ? windowWithAP.AP
    : kernel.get<AP.Instance>(ServiceIdentifier.AP)
);