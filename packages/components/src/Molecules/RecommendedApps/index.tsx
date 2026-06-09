import React from 'react';

import { Grid, Row } from '../../Atoms/Grid';
import { Header, Paragraph } from '../../Atoms/Typography';
import { RecommendedApp } from '../RecommendedApp';

interface RecommendedAppsProps {
  title: string;
  description: string;
  apps: Array<{ icon: string; name: string; url: string; }>;
}

export const RecommendedApps = ({ title, description, apps }: RecommendedAppsProps): JSX.Element => {
  return (
    <Grid fluid>
      <Row>
        <Header weight='h600'>{title}</Header>
      </Row>
      <Row margin='8px 0 0 0'>
        <Paragraph>
          { description }
        </Paragraph>
      </Row>
      { apps.map(({ icon, url, name }) => (
        <Row key={name} margin='8px 0 0 0'>
          <RecommendedApp logo={ icon } name={ name } url={ url } />
        </Row>
      ))}
    </Grid>
  )
}