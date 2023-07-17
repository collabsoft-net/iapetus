import { Atlassian } from '@collabsoft-net/types';
import { createContext } from 'react';

export const Host = createContext<Atlassian|null>(null);