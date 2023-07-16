import { AbstractRestClientService } from '@collabsoft-net/services';
import { createContext } from 'react';

export const RestClientService = createContext<typeof AbstractRestClientService|null>(null);