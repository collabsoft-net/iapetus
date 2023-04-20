
import { Property } from 'csstype';
import styled from 'styled-components';

import { BorderProps, FlexProps, getBorderProps, getFlexProps, getSizeProps,SizeProps } from '../Styled';


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
  span?: string|number;
  stretched?: boolean;
  inline?: boolean;

  display?: Property.Display;
  background?: Property.Background;
  cursor?: Property.Cursor;
  truncate?: boolean;
}

export const Column = styled.div<ColumnProps>`
  ${props => getSizeProps(props)}
  ${props => getBorderProps(props)}
  ${props => getFlexProps(props, props.inline)}

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
