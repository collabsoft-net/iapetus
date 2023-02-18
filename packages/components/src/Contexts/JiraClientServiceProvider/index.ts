
import kernel from '@collabsoft-net/inversify';
import { JiraClientService } from '@collabsoft-net/services';
import React from 'react';

export const JiraClientServiceProvider = React.createContext<Promise<JiraClientService>>(
  new Promise<JiraClientService>((resolve, reject) => {
    kernel.onReady(() => {
    if (kernel.isBound(JiraClientService.getIdentifier())) {
      const service = kernel.get<JiraClientService>(JiraClientService.getIdentifier());
      resolve(service);
    } else {
      reject(new Error(`Could not find instance of JiraClientService, please make sure to bind it in your Inversify configuration using "JiraClientService.getIdentifier()"`));
    }
  });
}));