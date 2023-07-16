import { AbstractRestClientService } from '@collabsoft-net/services';
import { createContext } from 'react';

export const RestClientService = createContext<AbstractRestClientService|null>(null);