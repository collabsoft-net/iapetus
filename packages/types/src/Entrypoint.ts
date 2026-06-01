import type { ReactElement } from 'react';

import type { Props } from './Props';

export interface EntryPoint<T extends Props> {
  name: string;
  selector?: string;
  getElement: (props: T) => Promise<ReactElement>;
}