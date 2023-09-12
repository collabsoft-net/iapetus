
import kernel from '@collabsoft-net/inversify';
import { interfaces } from 'inversify';
import React from 'react';

export const useContext = <T> (context: React.Context<T>, serviceIdentifier?: interfaces.ServiceIdentifier<T>) => {
  const ctx = React.useContext(context);
  if (ctx) {
    return ctx;
  } else if (serviceIdentifier && kernel.isBound(serviceIdentifier)) {
    return kernel.get<T>(serviceIdentifier);
  } else {
    throw new Error(`Failed to retrieve context, either through React.useContext() or IoC containter with service identifier '${serviceIdentifier?.toString()}'`);
  }
}