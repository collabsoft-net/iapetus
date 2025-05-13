
import { token } from '@atlaskit/tokens';
import styled from '@emotion/styled';
import { Property } from 'csstype';

export interface HeadingProps {
  weight?: 'h100'|'h200'|'h300'|'h400'|'h500'|'h600'|'h700'|'h800'|'h900';
  size?: 'xxsmall'|'xsmall'|'small'|'medium'|'large'|'xlarge'|'xxlarge';
  color?: Property.Color;
  display?: Property.Display;
  margin?: Property.Margin;
  truncate?: boolean;
}

export const Header = styled.span<HeadingProps>`
  display: ${props => props.display || 'block'};

  ${props => {
    if (props.weight) {
      switch(props.weight) {
        case 'h100':
        case 'h200': return `font: ${token('font.heading.xxsmall')};`
        case 'h300':
        case 'h400': return `font: ${token('font.heading.xsmall')};`
        case 'h500': return `font: ${token('font.heading.small')};`
        case 'h600': return `font: ${token('font.heading.medium')};`
        case 'h700': return `font: ${token('font.heading.large')};`
        case 'h800': return `font: ${token('font.heading.xlarge')};`
        case 'h900': return `font: ${token('font.heading.xxlarge')};`
        default:
          return `font: ${token('font.heading.medium')};`
      }
    } else if (props.size) {
      return `font: ${token(`font.heading.${props.size as 'xxsmall'|'xsmall'|'small'|'medium'|'large'|'xlarge'|'xxlarge'}`)};`
    } else {
      return `font: ${token('font.heading.medium')};`
    }
  }}

  ${props => props.margin ? `margin: ${props.margin};` : 'margin-top: 0;'}
  ${props => props.color && `color: ${props.color};`}
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;  

  ${props => props.truncate && `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
`;

type ParagraphProps = {
  color?: Property.Color;
  inline?: boolean;
  display?: Property.Display;
  margin?: Property.Margin;
  padding?: Property.Padding;
  truncate?: boolean;
};

export const Paragraph = styled.p<ParagraphProps>`
  font: ${token('font.body')};
  ${props => props.color && `color: ${props.color};`}
  ${props => props.inline && `display: inline;`}
  ${props => props.display && `display: ${props.display};`}
  ${props => props.margin && `margin: ${props.margin};`}
  ${props => props.padding && `padding: ${props.padding};`}
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;  

  ${props => props.truncate && `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
`;