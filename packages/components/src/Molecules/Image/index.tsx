import Avatar, { AvatarPropTypes,SizeType } from '@atlaskit/avatar';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

import { Column, Grid } from '../../Atoms/Grid'

interface ImageProps extends Omit<AvatarPropTypes, 'size'|'children'> {
  size: SizeType|number;
  margin?: string;
  align?: string;
}

const ImageWrapper = styled(Column)`font-size: 0;`;

const CustomImage = styled.div<{ src: string; size: number }>`
  background-image: url(${props => props.src});
  background-size: 100%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

export const Image = ({ children, align, src, size, margin, ...rest }: PropsWithChildren<ImageProps>): JSX.Element => {
  return (
    <Grid vertical fluid>
      <ImageWrapper margin={ children && margin ? margin : '0' }>
        { typeof size === 'number' ? (
          <CustomImage src={ src || '' } size={ size } />
        ) : (
          <Avatar size={ size } src={ src } {...rest} />
        )}
      </ImageWrapper>
      <Column stretched align={ align }>
        { children }
      </Column>
    </Grid>
  )

}