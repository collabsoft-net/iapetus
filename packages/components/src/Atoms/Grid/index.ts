
import styled from 'styled-components';

interface PageProps {
  background?: string;
  padding?: string;
}

export const Page = styled.div<PageProps>`
  ${props => props.background ? `background: ${props.background};` : `background-color: #fff;`}
  ${props => props.padding && `padding: ${props.padding};`} 
  height: 100%; 
  width: 100%;
`;

export interface GridProps {
  vertical?: boolean;
  padding?: string;
  margin?: string;
  fluid?: boolean;
  width?: string;
  height?: string;
  stretched?: boolean;
  backgroundColor?: string;
  boxShadow?: string;
  wraps?: boolean; // 'wrap' upsets React.DOM
  gap?: string;
  justifyContent?: string;
  alignItems?: string;
  borderRadius?: string;
  border?: string;
}

export const Grid = styled.div<GridProps>`
  display: flex;
  flex-direction: ${(props: GridProps) => !props.vertical ? 'column' : 'row' };
  box-sizing: border-box;

  ${props => props.margin && `margin: ${props.margin};`}
  ${props => props.padding && `padding: ${props.padding};`}
  ${props => props.vertical && !props.padding && `height: 100%;`}
  ${props => !props.vertical && !props.padding && `width: ${props.width || '100%'};`}
  ${props => props.width && `width: ${props.width};`}
  ${props => props.height && `height: ${props.height};`}
  ${props => props.stretched && `width: 100%; height: 100%;`}
  ${props => props.backgroundColor && `background-color: ${props.backgroundColor};`}
  ${props => props.wraps && `flex-wrap: wrap;`}
  ${props => props.justifyContent && `justify-content: ${props.justifyContent};`}
  ${props => props.alignItems && `align-items: ${props.alignItems};`}
  ${props => props.gap && `gap: ${props.gap};`}
  ${props => props.border && `border: ${props.border};`}
  ${props => props.borderRadius && `border-radius: ${props.borderRadius};`}
  ${props => props.boxShadow && `box-shadow: ${props.boxShadow};`}

  ${props => !props.fluid && !props.stretched && `
    @media(min-width: 990px) {
      width: ${props.width || '968px'};
      margin: ${props.margin || '0 auto'};
    }
  `}

  --component: grid;
`;

export interface ColumnProps {
  margin?: string;
  padding?: string;
  span?: string|number;
  stretched?: boolean;
  align?: string;
  height?: string;
  width?: string;
  minWidth?: string;
  borderRadius?: string;
  border?: string;
  background?: string;
}

export const Column = styled.div<ColumnProps>`
  ${props => props.margin && `margin: ${props.margin};`}
  ${props => props.padding && `padding: ${props.padding};`}
  ${props => props.align && `align-self: ${props.align};`}
  ${props => !props.stretched && `flex: ${props.span ? props.span : '0 0 auto'};`}
  ${props => props.stretched && `flex: 1 1 auto; overflow: auto;`}
  ${props => props.stretched && !props.width && `width: 100%;`}
  ${props => props.stretched && !props.height && `height: 100%;`}
  ${props => props.height && `height: ${props.height};`}
  ${props => props.width && `width: ${props.width};`}
  ${props => props.minWidth && `width: ${props.minWidth};`}
  ${props => props.border && `border: ${props.border};`}
  ${props => props.borderRadius && `border-radius: ${props.borderRadius};`}
  ${props => props.background && `background: ${props.background};`}
  box-sizing: border-box;
  --component: column;
`;

export const Row = styled(Column)`--component: row;`;


