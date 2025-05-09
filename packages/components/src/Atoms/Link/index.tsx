import { LinkButton,Spacing } from '@atlaskit/button/new';
import React from 'react';
import { PropsWithChildren } from 'react';

interface LinkProps  {
  href: string;
  spacing?: Spacing;
  target?: string;
}

export const Link = ({ href, target, spacing, children }: PropsWithChildren<LinkProps>): JSX.Element => (
  <LinkButton href={ href } spacing={ spacing } rel='noreferrer' target={ target || '_blank' }>{ children }</LinkButton>
);