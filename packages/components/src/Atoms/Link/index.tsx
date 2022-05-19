import Button, { Spacing } from '@atlaskit/button';
import React from 'react';
import { PropsWithChildren } from 'react';

interface LinkProps  {
  href: string;
  spacing?: Spacing;
  target?: string;
}

export const Link = ({ href, target, spacing, children }: PropsWithChildren<LinkProps>): JSX.Element => (
  <Button appearance='link' href={ href } spacing={ spacing || 'none' } rel='noreferrer' target={ target || '_blank' }>{ children }</Button>
);