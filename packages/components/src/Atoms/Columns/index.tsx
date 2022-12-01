import { isOfType } from '@collabsoft-net/helpers';
import React from 'react';

import { Column,ColumnProps, Grid, GridProps } from '../Grid';

interface ColumnsWithProps {
  content: JSX.Element;
  props?: ColumnProps;
}

interface ColumnsProps {
  items: Array<JSX.Element|ColumnsWithProps>;
  columnProps?: (defaultProps: ColumnProps, index: number) => ColumnProps;
}

export const Columns = ({ items, columnProps, ...props }: ColumnsProps & Omit<GridProps, 'vertical'>) => (
  <Grid vertical {...props}>
    { items.map((item, index) => {
        const defaultProps = { ...isOfType<ColumnsWithProps>(item, 'content') ? item.props || {} : {} };
        const customProps = { ...defaultProps, ...columnProps ? columnProps(defaultProps, index) : {} }
        const children = isOfType<ColumnsWithProps>(item, 'content') ? item.content : item;
        return <Column {...customProps}>{ children }</Column>
      })
    }
  </Grid>
)