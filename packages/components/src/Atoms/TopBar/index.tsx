import ChevronRight from '@atlaskit/icon/glyph/chevron-right';
import { colors } from '@atlaskit/theme';
import { token } from '@atlaskit/tokens';
import { isOfType } from '@collabsoft-net/helpers';
import React, { Fragment } from 'react';
import styled from 'styled-components';

import { IconWithLabel } from '../../Molecules/IconWithLabel';
import { Column, Grid, Row } from '../Grid';
import { withProps } from '../Styled';
import { Header } from '../Typography';

interface TopBarProps {
  title?: string|JSX.Element;
  Icon: JSX.Element;
  breadCrumbs?: Array<string|JSX.Element>;
  fixedOnTop?: boolean;
}

const Topbar = withProps<{ fixedOnTop?: boolean }>()(styled(Grid))`
  ${props => props.fixedOnTop && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  `}
`;

export const TopBar = ({ title, Icon, breadCrumbs, fixedOnTop }: TopBarProps) => (
  <Topbar fixedOnTop={ fixedOnTop } borderBottom={ fixedOnTop ? `1px solid ${token('color.border', colors.N20)}` : undefined } background={ token('elevation.surface', colors.N0) } fluid={ fixedOnTop }>
    <Row padding='16px'>
      <Grid fluid vertical alignItems='center'>
        { Icon && (
          <Column margin="0 8px 0 0">
            <IconWithLabel src={ Icon } />
          </Column>
        )}
        { title && (
          <Column align='center' margin='0 8px 0 0'>
            { typeof title === 'string' ? (
              <Header weight='h400'>{ title }</Header>
            ) : title }
          </Column>
        )}
        { breadCrumbs?.map(element => (
          <Fragment key={ isOfType<JSX.Element>(element, 'key') ? element.key : element }>
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
  </Topbar>
);
