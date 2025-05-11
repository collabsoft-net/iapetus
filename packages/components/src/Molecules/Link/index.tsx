
import DSLink, { LinkProps as ILinkProps } from '@atlaskit/link';
import { isOfType } from '@collabsoft-net/helpers';
import React from 'react';

import { useACJS } from '../../Hooks';

type LinkProps = ILinkProps & {
  type: 'product'|'app'|'external';
  onError?: (error: Error) => void;
}

export const Link = ({ type, onError, ...props }: LinkProps) => {
  const ACJS = useACJS();

  if (type === 'product') {
    if (!isOfType(ACJS, 'navigator')) {
      if (onError) {
        onError(new Error(`Type 'product' is not supported for this Atlassian host product`));
      }
      return <></>;
    } else {
      return <DSLink {...props} href="#" onClick={ (event) => {
        event.bubbles = false;
        event.preventDefault();
        event.stopPropagation();
        ACJS.navigator.go('site', { relativeUrl: props.href });
      }} />
    }
  } else if (type === 'external') {
    return <DSLink {...props} rel="noreferrer" target="_blank" />
  } else {
    return <DSLink {...props} />
  }
}