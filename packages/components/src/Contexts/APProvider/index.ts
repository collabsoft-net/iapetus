
import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import React from 'react';

export const APProvider = React.createContext<Promise<AP.Instance>>(
  new Promise<AP.Instance>((resolve, reject) => {
    kernel.onReady(() => {
    if (kernel.isBound(ServiceIdentifier.AP)) {
      const AP = kernel.get<AP.Instance>(ServiceIdentifier.AP);
      resolve(AP);
    } else {
      reject(new Error(`Could not find instance of AP, please make sure to bind it in your Inversify configuration using "ServiceIdentifier.AP"`));
    }
  });
}));