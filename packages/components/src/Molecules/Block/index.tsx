import { colors } from '@atlaskit/theme';
import React, { PropsWithChildren } from 'react';

import { Grid, Row } from '../../Atoms/Grid';
import { Header } from '../../Atoms/Typography';

interface BlockProps {
  header?: string;
  title?: string;
  description?: string;
}

export const Block = ({ header, title, description, children }: PropsWithChildren<BlockProps>): JSX.Element => {
  return (
    <Grid fluid padding='24px' borderRadius='8px' backgroundColor={colors.N20}>
      <Row margin={ header ? '0 0 8px' : '0' }>
        { header && (<Header weight='h600'>{ header }</Header>)}
        { title && (<Header weight='h300'>{ title }</Header>)}
      </Row>
      { description && (
        <Row margin='4px 0 8px 0'>
          <Header weight='h500'>{ description }</Header>
        </Row>
      )}
      <Row>
        { children }
      </Row>
    </Grid>
  );
}