
import DSLink, { LinkProps as ILinkProps } from '@atlaskit/link';
import React from 'react';

import { usePlatformBridge } from '../../Hooks';

type LinkProps = ILinkProps & {
  type: 'product'|'app'|'external';
  onError?: (error: Error) => void;
}

export const Link = ({ type, onError, ...props }: LinkProps) => {
  const bridge = usePlatformBridge();

  if (type === 'product') {
    return <DSLink {...props} href="#" onClick={ (event) => {
      event.bubbles = false;
      event.preventDefault();
      event.stopPropagation();
      bridge.router.navigate(props.href);
    }} />
  } else if (type === 'external') {
    return <DSLink {...props} rel="noreferrer" target="_blank" />
  } else {
    return <DSLink {...props} />
  }
}