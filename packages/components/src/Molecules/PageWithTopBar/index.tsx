import { colors } from '@atlaskit/theme';
import { token } from '@atlaskit/tokens';
import styled from '@emotion/styled';
import React, { PropsWithChildren } from 'react';

import { Grid, Row } from '../../Atoms/Grid';
import { Page } from '../../Atoms/Page';
import { TopBar } from '../../Atoms/TopBar';

const FullPage = styled(Page)`
  display: flex;
  overflow: hidden;
  flex-direction: column;
`;

const ScrollView = styled(Grid)`
  overflow: scroll;
`;

interface PageWithNavBarProps {
  title?: string|JSX.Element;
  Icon: JSX.Element;
  Banner?: JSX.Element;
  breadCrumbs?: Array<string|JSX.Element>;
  icons?: Array<JSX.Element>;
  inline?: boolean;
  fullPage?: boolean;
}

export const PageWithTopBar = ({ title, Icon, Banner, breadCrumbs, icons, inline, fullPage, children }: PropsWithChildren<PageWithNavBarProps>) => {

  const margin = inline
    ? undefined
    : typeof Banner === 'undefined'
      ? '64px 0 0'
      : '112px 0 0';

  return (
    <FullPage height={ !inline ? '100%' : undefined } background={ token(inline ? 'elevation.surface' : 'elevation.surface.sunken', inline ? colors.N0 : colors.N400A) }>
      <TopBar title={ title } Icon={ Icon } Banner={ Banner } breadCrumbs={ breadCrumbs } icons={ icons } fixedOnTop={ !inline } />
      <ScrollView fluid stretched height='unset' margin={ margin }>
        <Row stretched>
          <Grid fluid={ fullPage } stretched={ fullPage } margin={ fullPage ? undefined : '0 auto' } padding={ inline ? '16px 0' : '24px 0' }>
            <Row stretched>
              {children}
            </Row>
          </Grid>
        </Row>
      </ScrollView>
    </FullPage>
  );
}