import Button from '@atlaskit/button';
import React from 'react';
import { PropsWithChildren } from 'react';

interface LinkProps  {
  href: string;
}

export const Link = ({ href, children }: PropsWithChildren<LinkProps>): JSX.Element => <Button appearance='link' href={ href } spacing='none' rel='noreferrer' target='_blank'>{ children }</Button>;