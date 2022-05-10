import Avatar from '@atlaskit/avatar';
import React from 'react';
import styled from 'styled-components';

import { Column, Grid } from '../../Atoms/Grid';
import { Link } from '../../Atoms/Link';

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
        <Link href={url}>{ name }</Link>
      </Column>
    </Grid>
  );
}