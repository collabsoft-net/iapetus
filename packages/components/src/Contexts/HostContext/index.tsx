import { createContext } from 'react';

export const HostContext = createContext<AP.JiraContext|AP.ConfluenceContext|undefined>(undefined);