
import { Modes } from '@collabsoft-net/enums';
import kernel from '@collabsoft-net/inversify';
import { JiraClientService as Service } from '@collabsoft-net/services';
import React from 'react';

export const JiraClientService = React.createContext<Service<Modes>|null>(kernel.isBound(Service.getIdentifier()) ? kernel.get<Service<Modes>>(Service.getIdentifier()) : null);
