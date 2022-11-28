import Avatar, { AvatarPropTypes,SizeType } from '@atlaskit/avatar';
import React, { PropsWithChildren, ReactNode } from 'react';
import styled from 'styled-components';

import { Column, Grid } from '../../Atoms/Grid'

interface ImageProps extends Omit<AvatarPropTypes, 'src'|'size'|'children'> {
  src: string|ReactNode|JSX.Element;
  size?: SizeType|number;
  margin?: string;
  align?: string;
  position?: 'left'|'right'
}

const ImageWrapper = styled(Column)`font-size: 0;`;

const CustomImage = styled.div<{ src: string; size: number }>`
  background-image: url(${props => props.src});
  background-size: 100%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

export const Image = ({ children, align, src, size, margin, position, ...rest }: PropsWithChildren<ImageProps>): JSX.Element => {
  return (
    <Grid vertical fluid>
      { children && (position === 'right') && (
        <Column stretched align={ align }>
          { children }
        </Column>
      )}

      <ImageWrapper margin={ children && margin ? margin : '0' }>
        { typeof src !== 'string' ? src : (
          typeof size === 'number' ? (
            <CustomImage src={ src || '' } size={ size } />
          ) : (
            <Avatar size={ size } src={ src } {...rest} />
          )
        )}
      </ImageWrapper>

      { children && (!position || position === 'left') && (
        <Column stretched align={ align }>
          { children }
        </Column>
      )}
    </Grid>
  )

}