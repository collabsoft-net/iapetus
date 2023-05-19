
import kernel from '@collabsoft-net/inversify';
import { ConfluenceClientService } from '@collabsoft-net/services';
import React from 'react';

export const ConfluenceClientServiceContext = React.createContext<Promise<ConfluenceClientService|null>>(
  new Promise<ConfluenceClientService|null>(resolve => {
    kernel.onReady(() => {
    if (kernel.isBound(ConfluenceClientService.getIdentifier())) {
      const service = kernel.get<ConfluenceClientService>(ConfluenceClientService.getIdentifier());
      resolve(service);
    } else {
      resolve(null);
    }
  });
}));