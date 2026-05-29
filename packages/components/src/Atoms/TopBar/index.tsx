import ChevronRight from '@atlaskit/icon/core/chevron-right';
import { token } from '@atlaskit/tokens';
import { isOfType } from '@collabsoft-net/helpers';
import styled from '@emotion/styled';
import React, { Fragment } from 'react';

import { IconWithLabel } from '../../Molecules/IconWithLabel';
import { Column, Grid, Row } from '../Grid';
import { Header } from '../Typography';

interface TopBarProps {
  title?: string|JSX.Element;
  Icon: JSX.Element;
  Banner?: JSX.Element;
  breadCrumbs?: Array<string|JSX.Element>;
  icons?: Array<JSX.Element>;
  fixedOnTop?: boolean;
}

const Topbar = styled(Grid)<{ fixedOnTop?: boolean }>`
  ${props => props.fixedOnTop && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  `}
`;

export const TopBar = ({ title, Icon, Banner, breadCrumbs, icons, fixedOnTop }: TopBarProps) => (
  <Topbar fixedOnTop={ fixedOnTop } borderBottom={ fixedOnTop ? `1px solid ${token('color.border')}` : undefined } background={ token('elevation.surface') } fluid={ fixedOnTop }>
    { Banner && (
      <Row>
        { Banner }
      </Row>
    )}
    <Row padding='20px'>
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
        <Column stretched></Column>
        { icons?.map(element => (
          <Column key={ element.key } margin='0 8px 0 0'>
            { element }
          </Column>
        ))}
      </Grid>
    </Row>
  </Topbar>
);
