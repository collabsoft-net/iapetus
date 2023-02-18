
import kernel from '@collabsoft-net/inversify';
import { ConfluenceClientService } from '@collabsoft-net/services';
import React from 'react';

export const ConfluenceClientServiceProvider = React.createContext<Promise<ConfluenceClientService>>(
  new Promise<ConfluenceClientService>((resolve, reject) => {
    kernel.onReady(() => {
    if (kernel.isBound(ConfluenceClientService.getIdentifier())) {
      const service = kernel.get<ConfluenceClientService>(ConfluenceClientService.getIdentifier());
      resolve(service);
    } else {
      reject(new Error(`Could not find instance of ConfluenceClientService, please make sure to bind it in your Inversify configuration using "ConfluenceClientService.getIdentifier()"`));
    }
  });
}));