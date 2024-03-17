import { colors } from '@atlaskit/theme';
import { token } from '@atlaskit/tokens';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

import { Grid, Row } from '../../Atoms/Grid';
import { Page } from '../../Atoms/Page';
import { TopBar } from '../../Atoms/TopBar';

const FullPage = styled(Page)`
  display: flex;
  overflow: hidden;
`;

const ScrollView = styled(Grid)`
  overflow: scroll;
`;

interface PageWithNavBarProps {
  title: string;
  Icon: JSX.Element;
  breadCrumbs?: Array<string|JSX.Element>;
}

export const PageWithTopBar = ({ title, Icon, breadCrumbs, children }: PropsWithChildren<PageWithNavBarProps>) => (
  <FullPage height='100%' background={ token('elevation.surface.sunken', colors.N400A) }>
    <TopBar title={ title } Icon={ Icon } breadCrumbs={ breadCrumbs } />
    <ScrollView fluid height='unset' margin='60px 0 0'>
      <Row>
        <Grid width='768px' margin='0 auto' padding='24px 0'>
          <Row>
            {children}
          </Row>
        </Grid>
      </Row>
    </ScrollView>
  </FullPage>
)