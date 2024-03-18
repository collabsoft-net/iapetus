import { colors } from '@atlaskit/theme';
import { token } from '@atlaskit/tokens';
import { ServiceIdentifier } from '@collabsoft-net/connect';
import { isOfType } from '@collabsoft-net/helpers';
import kernel from '@collabsoft-net/inversify';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

import { Grid, Row } from '../../Atoms/Grid';
import { Page } from '../../Atoms/Page';
import { TopBar } from '../../Atoms/TopBar';
import { AP } from '../../Contexts/AP';
import { useContext } from '../../Hooks';

const FullPage = styled(Page)`
  display: flex;
  overflow: hidden;
  flex-direction: column;
`;

const ScrollView = styled(Grid)`
  overflow: scroll;
`;

interface PageWithNavBarProps {
  title: string;
  Icon: JSX.Element;
  breadCrumbs?: Array<string|JSX.Element>;
}

export const PageWithTopBar = ({ title, Icon, breadCrumbs, children }: PropsWithChildren<PageWithNavBarProps>) => {

  const ACJS = useContext(AP, kernel.get(ServiceIdentifier.AP));
  const isConfluence = isOfType<AP.ConfluenceInstance>(ACJS, 'confluence');

  return (
    <FullPage height={ !isConfluence ? '100%' : undefined } background={ token(isConfluence ? 'elevation.surface' : 'elevation.surface.sunken', isConfluence ? colors.N0 : colors.N400A) }>
      <TopBar title={ title } Icon={ Icon } breadCrumbs={ breadCrumbs } />
      <ScrollView fluid height='unset' margin={ !isConfluence ? '60px 0 0' : undefined }>
        <Row>
          <Grid margin='0 auto' padding={ isConfluence ? '16px 0' : '24px 0' }>
            <Row>
              {children}
            </Row>
          </Grid>
        </Row>
      </ScrollView>
    </FullPage>
  )
}