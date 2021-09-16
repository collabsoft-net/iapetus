
import { fontFamily, fontSize } from '@atlaskit/theme';
import { h100, h200, h300, h400, h500, h600, h700, h800, h900 } from '@atlaskit/theme/typography';
import styled, { css } from 'styled-components';

import { withProps } from '../Styled';

export interface HeadingProps {
  weight: 'h100'|'h200'|'h300'|'h400'|'h500'|'h600'|'h700'|'h800'|'h900';
  color?: string;
  display?: string;
  margin?: string;
}

const heading = withProps<HeadingProps>()(css)`
  display: ${props => props.display || 'block'};
  font-family: ${fontFamily()};
  ${props => props.weight === 'h100' && h100()}
  ${props => props.weight === 'h200' && h200()}
  ${props => props.weight === 'h300' && h300()}
  ${props => props.weight === 'h400' && h400()}
  ${props => props.weight === 'h500' && h500()}
  ${props => props.weight === 'h600' && h600()}
  ${props => props.weight === 'h700' && h700()}
  ${props => props.weight === 'h800' && h800()}
  ${props => props.weight === 'h900' && h900()}
  ${props => props.margin ? `margin: ${props.margin};` : 'margin-top: 0;'}
  ${props => props.color && `color: ${props.color};`}
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;  
`;

export const Header = withProps<HeadingProps>()(styled.span)`${heading}`;

type ParagraphProps = {
  color?: string;
  inline?: boolean;
  display?: string;
  margin?: string;
  padding?: string;
};

export const Paragraph = withProps<ParagraphProps>()(styled.p)`
  font-family: ${fontFamily()};
  font-style: normal;
  font-weight: normal;
  font-size: ${fontSize()}px;
  line-height: 20px;
  ${props => props.color && `color: ${props.color};`}
  ${props => props.inline && `display: inline;`}
  ${props => props.display && `display: ${props.display};`}
  ${props => props.margin && `margin: ${props.margin};`}
  ${props => props.padding && `padding: ${props.padding};`}
`;