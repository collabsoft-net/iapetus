import { isOfType } from '@collabsoft-net/helpers';
import React from 'react';

import { Column,ColumnProps, Grid, GridProps } from '../Grid';

interface ColumnsWithProps {
  children: JSX.Element;
  props?: ColumnProps;
}

interface ColumnsProps {
  columns: Array<typeof Column|JSX.Element|ColumnsWithProps>
  stretched?: number;
}

export const Columns = ({ columns, stretched, ...props }: ColumnsProps & Omit<GridProps, 'vertical'>) => (
  <Grid vertical {...props}>
    { columns.map((column, index) =>
      isOfType<typeof Column>(column, 'displayName')
       ? column
       : isOfType<ColumnsWithProps>(column, 'children')
        ? <Column stretched={ stretched && index === stretched } {...column.props}>{ column.children } </Column>
        : <Column stretched={ stretched && index === stretched }>column</Column>
    )}
  </Grid>
)