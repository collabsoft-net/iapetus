import Avatar from '@atlaskit/avatar';
import styled from '@emotion/styled';
import React from 'react';

import { Column, Grid } from '../../Atoms/Grid';
import { Link } from '../Link';

interface RecommendedAppProps {
  logo: string;
  name: string;
  url: string;
}

const ImageWrapper = styled(Column)`font-size: 0;`;

export const RecommendedApp = ({ logo, name, url }: RecommendedAppProps): JSX.Element => {
  return (
    <Grid fluid vertical>
      <ImageWrapper margin='0 8px 0 0'>
        <Avatar size='medium' appearance='square' src={ logo } />
      </ImageWrapper>
      <Column stretched align='center'>
        <Link type="external" href={url}>{ name }</Link>
      </Column>
    </Grid>
  );
}