import Avatar, { AvatarPropTypes,SizeType } from '@atlaskit/avatar';
import { Property } from 'csstype';
import React, { PropsWithChildren, ReactNode } from 'react';
import styled from 'styled-components';

import { Column, Grid } from '../../Atoms/Grid'

interface IconWithLabelProps extends Omit<AvatarPropTypes, 'src'|'size'|'children'> {
  src: string|ReactNode|JSX.Element;
  shouldFitContainer?: boolean;
  justifyContent?: Property.JustifyContent;
  size?: SizeType|number;
  margin?: string;
  align?: string;
  position?: 'left'|'right'
}

const ImageWrapper = styled(Column)`
  font-size: 0;
  display: flex;
`;

const CustomImage = styled.div<{ src: string; size: number }>`
  background-image: url(${props => props.src});
  background-size: 100%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

export const IconWithLabel = ({ children, shouldFitContainer, align, src, size, margin, justifyContent, position, ...rest }: PropsWithChildren<IconWithLabelProps>): JSX.Element => {
  return (
    <Grid vertical fluid justifyContent={ justifyContent }>
      { children && (position === 'right') && (
        <Column stretched={ shouldFitContainer } align={ align }>
          { children }
        </Column>
      )}

      <ImageWrapper margin={ children && margin ? margin : '0' } align={ align }>
        { typeof src !== 'string' ? src : (
          typeof size === 'number' ? (
            <CustomImage src={ src || '' } size={ size } />
          ) : (
            <Avatar size={ size } src={ src } {...rest} />
          )
        )}
      </ImageWrapper>

      { children && (!position || position === 'left') && (
        <Column stretched={ shouldFitContainer } align={ align }>
          { children }
        </Column>
      )}
    </Grid>
  )

}