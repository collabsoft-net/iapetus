
import kernel from '@collabsoft-net/inversify';
import { BitbucketClientService as Service } from '@collabsoft-net/services';
import React from 'react';

export const BitbucketClientService = React.createContext<Service|null>(kernel.isBound(Service.getIdentifier()) ? kernel.get<Service>(Service.getIdentifier()) : null);
