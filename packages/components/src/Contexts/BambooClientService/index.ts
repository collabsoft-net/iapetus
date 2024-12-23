
import kernel from '@collabsoft-net/inversify';
import { BambooClientService as Service } from '@collabsoft-net/services';
import React from 'react';

export const BambooClientService = React.createContext<Service|null>(kernel.isBound(Service.getIdentifier()) ? kernel.get<Service>(Service.getIdentifier()) : null);
