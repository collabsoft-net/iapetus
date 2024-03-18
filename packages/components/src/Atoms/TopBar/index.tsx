import ChevronRight from '@atlaskit/icon/glyph/chevron-right';
import { colors } from '@atlaskit/theme';
import { token } from '@atlaskit/tokens';
import { ServiceIdentifier } from '@collabsoft-net/connect';
import { isOfType } from '@collabsoft-net/helpers';
import kernel from '@collabsoft-net/inversify';
import React, { Fragment } from 'react';
import styled from 'styled-components';

import { AP } from '../../Contexts/AP';
import { useContext } from '../../Hooks';
import { IconWithLabel } from '../../Molecules/IconWithLabel';
import { Column, Grid, Row } from '../Grid';
import { withProps } from '../Styled';
import { Header } from '../Typography';

interface TopBarProps {
  title: string;
  Icon: JSX.Element;
  breadCrumbs?: Array<string|JSX.Element>;
}

const Topbar = withProps<{ isFixed: boolean }>()(styled(Grid))`
  ${props => props.isFixed && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  `}
`;

export const TopBar = ({ title, Icon, breadCrumbs }: TopBarProps) => {

  const ACJS = useContext(AP, kernel.get(ServiceIdentifier.AP));
  const isConfluence = isOfType<AP.ConfluenceInstance>(ACJS, 'confluence');

  return (
    <Topbar isFixed={ !isConfluence } borderBottom={ !isConfluence ? `1px solid ${token('color.border', colors.N20)}` : undefined } background={ token('elevation.surface', colors.N0) } fluid={ !isConfluence }>
      <Row padding='16px'>
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
}
