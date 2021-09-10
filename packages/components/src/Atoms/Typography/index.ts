
import { AtlaskitThemeProps, CustomThemeProps, fontFamily, fontSize, NoThemeProps } from '@atlaskit/theme';
import { h100, h200, h300, h400, h500, h600, h700, h800, h900 } from '@atlaskit/theme/typography';
import styled, { css, FlattenInterpolation, ThemedStyledProps } from 'styled-components';

import { withProps } from '../Styled';

export interface HeadingProps {
  weight: 'h100'|'h200'|'h300'|'h400'|'h500'|'h600'|'h700'|'h800'|'h900';
  color?: string;
  display?: string;
  margin?: string;
}

const fixAtlasKit = (themes: Array<FlattenInterpolation<ThemedStyledProps<AtlaskitThemeProps | CustomThemeProps | NoThemeProps | undefined, unknown>>>) => {
  const result: Array<string> = [];
  let intermediateResult = '';
  themes.forEach(theme => {
    let value;

    const valueOf = theme?.valueOf();
    if (typeof valueOf === 'function') {
      value = valueOf();
    } else {
      value = valueOf;
    }

    if (typeof value === 'string') {
      if (value.trim().endsWith(';')) {
        if (intermediateResult !== '') {
          intermediateResult += value;
          if (intermediateResult.trim().endsWith(';')) {
            result.push(intermediateResult);
            intermediateResult = '';
          }
        } else {
          result.push(value);
        }
      } else {
        intermediateResult += value;
      }
    }
  });

  return result.join('\n');
};

const heading = withProps<HeadingProps>()(css)`
  display: ${props => props.display || 'block'};
  font-family: ${fontFamily()};
  ${props => props.weight === 'h100' && fixAtlasKit(h100())}
  ${props => props.weight === 'h200' && fixAtlasKit(h200())}
  ${props => props.weight === 'h300' && fixAtlasKit(h300())}
  ${props => props.weight === 'h400' && fixAtlasKit(h400())}
  ${props => props.weight === 'h500' && fixAtlasKit(h500())}
  ${props => props.weight === 'h600' && fixAtlasKit(h600())}
  ${props => props.weight === 'h700' && fixAtlasKit(h700())}
  ${props => props.weight === 'h800' && fixAtlasKit(h800())}
  ${props => props.weight === 'h900' && fixAtlasKit(h900())}
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