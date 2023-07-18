
import kernel from '@collabsoft-net/inversify';
import { ConfluenceClientService as Service } from '@collabsoft-net/services';
import React from 'react';

export const ConfluenceClientService = React.createContext<Service>(kernel.get<Service>(Service.getIdentifier()));