
import kernel from '@collabsoft-net/inversify';
import { JiraClientService } from '@collabsoft-net/services';
import React from 'react';

export const JiraClientServiceProvider = React.createContext<Promise<JiraClientService|null>>(
  new Promise<JiraClientService|null>(resolve => {
    kernel.onReady(() => {
    if (kernel.isBound(JiraClientService.getIdentifier())) {
      const service = kernel.get<JiraClientService>(JiraClientService.getIdentifier());
      resolve(service);
    } else {
      resolve(null);
    }
  });
}));