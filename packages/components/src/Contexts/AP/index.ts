
import { ServiceIdentifier } from '@collabsoft-net/connect';
import kernel from '@collabsoft-net/inversify';
import React from 'react';

const windowWithAP = window as unknown as Window & { AP: AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance };

export const AP = React.createContext<AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance|null>(
  windowWithAP.AP
    ? windowWithAP.AP
    : kernel.isBound(ServiceIdentifier.AP)
      ? kernel.get<AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance>(ServiceIdentifier.AP)
      : null
);