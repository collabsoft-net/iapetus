
import { Property } from 'csstype';
import styled from 'styled-components';

interface SizeProps {
  padding?: Property.Padding;
  margin?: Property.Margin;
  marginLeft?: Property.MarginLeft;
  marginRight?: Property.MarginRight;
  marginBottom?: Property.MarginBottom;
  marginTop?: Property.MarginTop;
  height?: Property.Height;
  width?: Property.Width;
  minWidth?: Property.MinWidth;
  maxWidth?: Property.MinHeight;
}

const getSizeProps = (props: SizeProps) => `
  ${props.width ? `width: ${props.width};` : ''}
  ${props.height ? `height: ${props.height};` : ''}
  ${props.margin ? `margin: ${props.margin};` : ''}
  ${props.marginLeft ? `margin-left: ${props.marginLeft};` : ''}
  ${props.marginRight ? `margin-right: ${props.marginRight};` : ''}
  ${props.marginBottom ? `margin-bottom: ${props.marginBottom};` : ''}
  ${props.marginTop ? `margin-top: ${props.marginTop};` : ''}
  ${props.padding ? `padding: ${props.padding};` : ''}
  ${props.minWidth ? `min-width: ${props.minWidth};` : ''}
  ${props.maxWidth ? `max-width: ${props.maxWidth};` : ''}
`.trim();

interface BorderProps {
  borderRadius?: Property.BorderRadius;
  border?: Property.Border;
  borderTop?: Property.BorderTop;
  borderRight?: Property.BorderRight;
  borderBottom?: Property.BorderBottom;
  borderLeft?: Property.BorderLeft;
  boxShadow?: Property.BoxShadow;
}

const getBorderProps = (props: BorderProps) => `
  ${props.borderRadius ? `border-radius: ${props.borderRadius};` : ''}
  ${props.border ? `border: ${props.border};` : ''}
  ${props.borderTop ? `border-top: ${props.borderTop};` : ''}
  ${props.borderRight ? `border-right: ${props.borderRight};` : ''}
  ${props.borderBottom ? `border-bottom: ${props.borderBottom};` : ''}
  ${props.borderLeft ? `border-left: ${props.borderLeft};` : ''}
  ${props.boxShadow ? `box-shadow: ${props.boxShadow};` : ''}
`.trim();

interface FlexProps {
  gap?: Property.Gap;
  justifyContent?: Property.JustifyContent;
  alignItems?: Property.AlignItems;
  align?: Property.AlignSelf;
  wraps?: boolean; // 'wrap' upsets React.DOM
}

const getFlexProps = (props: FlexProps) => `
  ${Object.keys(props).length > 0 ? `display: inline-flex` : ''}
  ${props.gap ? `gap: ${props.gap};` : ''}
  ${props.justifyContent ? `justify-content: ${props.justifyContent};` : ''}
  ${props.alignItems ? `align-items: ${props.alignItems};` : ''}
  ${props.align ? `align-self: ${props.align};` : ''}
  ${props.wraps ? `flex-wrap: wrap;` : ''}
`.trim();


interface PageProps {
  background?: Property.Background;
  padding?: Property.Padding;
}

export const Page = styled.div<PageProps>`
  ${props => props.background ? `background: ${props.background};` : `background-color: #fff;`}
  ${props => props.padding && `padding: ${props.padding};`} 
  height: 100%; 
  width: 100%;
`;

export interface GridProps extends SizeProps, BorderProps, FlexProps {
  fluid?: boolean;
  vertical?: boolean;
  stretched?: boolean;
  background?: Property.Background;
  cursor?: Property.Cursor;
}

export const Grid = styled.div<GridProps>`
  ${props => getSizeProps(props)}
  ${props => getBorderProps(props)}
  ${props => getFlexProps(props)}

  display: flex;
  flex-direction: ${(props: GridProps) => !props.vertical ? 'column' : 'row' };
  box-sizing: border-box;

  ${props => props.vertical && !props.padding && `height: 100%;`}
  ${props => !props.vertical && !props.padding && `width: ${props.width || '100%'};`}
  ${props => props.stretched && `width: 100%; height: 100%;`}
  ${props => props.background && `background: ${props.background};`}
  ${props => props.cursor && `cursor: ${props.cursor};`}

  ${props => !props.fluid && !props.stretched && `
    @media(min-width: 990px) {
      width: ${props.width || '968px'};
      margin: ${props.margin || '0 auto'};
    }
  `}

  --component: grid;
`;

export interface ColumnProps extends SizeProps, BorderProps, FlexProps {
  display?: Property.Display;
  span?: string|number;
  stretched?: boolean;
  background?: Property.Background;
  cursor?: Property.Cursor;
  truncate?: boolean;
}

export const Column = styled.div<ColumnProps>`
  ${props => getSizeProps(props)}
  ${props => getBorderProps(props)}
  ${props => getFlexProps(props)}

  ${props => props.display && `display: ${props.display};`}
  ${props => !props.stretched && `flex: ${props.span ? props.span : '0 0 auto'};`}
  ${props => props.stretched && `flex: 1 1 auto; overflow: auto;`}
  ${props => props.stretched && !props.width && `width: 100%;`}
  ${props => props.stretched && !props.height && `height: 100%;`}
  ${props => props.background && `background: ${props.background};`}
  ${props => props.cursor && `cursor: ${props.cursor};`}

  ${props => props.truncate && `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}

  box-sizing: border-box;
  --component: column;
`;

export const Row = styled(Column)`--component: row;`;
