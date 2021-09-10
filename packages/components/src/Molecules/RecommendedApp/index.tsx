import Avatar from '@atlaskit/avatar';
import Button from '@atlaskit/button';
import React from 'react';
import styled from 'styled-components';

import { Column, Grid } from '../../Atoms/Grid';

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
        <Button appearance='link' target='_blank' spacing='none' href={url}>{ name }</Button>
      </Column>
    </Grid>
  );
}