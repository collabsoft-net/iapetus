import { colors } from '@atlaskit/theme';
import React from 'react';

import { Grid, Row } from '../../Atoms/Grid';
import { Link } from '../../Atoms/Link';
import { Header, Paragraph } from '../../Atoms/Typography';
import { Image } from '../Image';

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
        <Paragraph color={colors.N600}>
          { description }
        </Paragraph>
      </Row>
      { apps.map(({ icon, url, name }) => (
        <Row key={name} margin='8px 0 0 0'>
          <Image src={ icon } size='medium' margin='0 8px 0 0' appearance='square' align='center'>
            <Link href={url}>{ name }</Link>
          </Image>
        </Row>
      ))}
    </Grid>
  )
}