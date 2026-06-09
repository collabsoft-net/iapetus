import React from 'react';

import { IconWithLabel } from '../IconWithLabel';
import { Link } from '../Link';

interface RecommendedAppProps {
  logo: string;
  name: string;
  url: string;
}

export const RecommendedApp = ({ logo, name, url }: RecommendedAppProps): JSX.Element => {
  return (
    <IconWithLabel src={ logo } size='medium' margin='0 8px 0 0' appearance='square' align='center'>
      <Link type="external" href={url} target='_blank'>{ name }</Link>
    </IconWithLabel>
  );
}