import { Modes } from '@collabsoft-net/enums';
import { createContext } from 'react';

export const Mode = createContext<Modes>(Modes.CONNECT);