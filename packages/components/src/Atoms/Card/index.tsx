import { colors } from '@atlaskit/theme';
import { token } from '@atlaskit/tokens';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

import { Grid, GridProps, Row } from '../Grid';
import { Header } from '../Typography';

interface CardProps {
  header?: string|JSX.Element;
}

const Container = styled(Grid)`
  background: ${token('elevation.surface', colors.N0)};
  border: 1px solid ${token('color.border', colors.N20A)};
  border-radius: 8px;
`;

const CardHeader = styled(Row)`
  box-shadow: 0px 1px 0px ${token('color.border', colors.N20A)};
`

export const Card = ({ header, padding, children, ...props }: PropsWithChildren<CardProps & GridProps>) => (
  <Container {...props}>
    { header && (
      <CardHeader padding='16px 24px'>
        { typeof header === 'string' ? <Header weight='h600'>{ header }</Header> : header}
      </CardHeader>
    )}

    <Row padding={ padding }>
      { children }
    </Row>
  </Container>
);
