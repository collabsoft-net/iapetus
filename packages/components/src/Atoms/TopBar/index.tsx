import ChevronRight from '@atlaskit/icon/glyph/chevron-right';
import { colors } from '@atlaskit/theme';
import { token } from '@atlaskit/tokens';
import React, { Fragment } from 'react';
import styled from 'styled-components';

import { IconWithLabel } from '../../Molecules/IconWithLabel';
import { Column, Grid, Row } from '../Grid';
import { Header } from '../Typography';

interface TopBarProps {
  title: string;
  Icon: JSX.Element;
  breadCrumbs?: Array<JSX.Element>;
}

const FixedTopbar = styled(Grid)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

export const TopBar = ({ title, Icon, breadCrumbs }: TopBarProps) => (
  <FixedTopbar borderBottom={ `1px solid ${token('color.border', colors.N20)}` } background={ token('elevation.surface', colors.N0) } fluid>
    <Row borderBottom={ `border-bottom: 1px solid ${colors.N30}; `} padding='16px'>
      <Grid fluid vertical alignItems='center'>
        { Icon && (
          <Column margin="0 8px 0 0">
            <IconWithLabel src={ Icon } />
          </Column>
        )}
        <Column align='center' margin='0 8px 0 0'>
          <Header weight='h400'>{ title }</Header>
        </Column>
        { breadCrumbs?.map(element => (
          <Fragment key={ element.key }>
            <Column align='center' margin='0 8px 0 0'>
              <IconWithLabel src={ <ChevronRight label='Breadcrumb' /> } />
            </Column>
            <Column align='center' cursor='pointer'>
              { element }
            </Column>
          </Fragment>
        ))}
      </Grid>
    </Row>
  </FixedTopbar>
);
