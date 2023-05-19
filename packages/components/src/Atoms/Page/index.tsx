import { Property } from 'csstype';
import React, { HTMLAttributes, PropsWithChildren } from 'react';
import styled from 'styled-components';

import { getSizeProps,SizeProps } from '../Styled';

const Wrapper = styled.div<PageProps & SizeProps>`
  ${props => getSizeProps(props)}
  ${props => props.background ? `background: ${props.background};` : `background-color: #fff;`}
`;

interface PageProps {
  background?: Property.Background;
  isRootElement?: boolean;
}

export const Page = ({ isRootElement, children, ...props }: PropsWithChildren<PageProps & SizeProps & HTMLAttributes<HTMLDivElement>>) => (
  <Wrapper {...props} className={ isRootElement === false ? '' : 'ac-content' }>
    { children }
  </Wrapper>
);