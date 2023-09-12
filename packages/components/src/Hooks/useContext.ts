
import kernel from '@collabsoft-net/inversify';
import React from 'react';

export const useContext = <T> (context: React.Context<T>, serviceIdentifier?: string) => {

  const ctx = React.useContext(context);

  if (ctx) {
    return ctx;
  } else if (serviceIdentifier) {
    const fallback = kernel.get<T>(serviceIdentifier);
    if (fallback) {
      return fallback;
    }
  }

  throw new Error(`Failed to retrieve context, either through React.useContext() or IoC containter with service identifier '${serviceIdentifier}'`);
}