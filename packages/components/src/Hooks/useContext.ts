
import kernel from '@collabsoft-net/inversify';
import type { ServiceIdentifier } from 'inversify';
import React from 'react';

export function useContext<T>(context: React.Context<T>, serviceIdentifier?: ServiceIdentifier<T>): T;
export function useContext<T>(context: React.Context<T|null>, serviceIdentifier?: ServiceIdentifier<T>): T;
export function useContext<T>(context: React.Context<T|undefined>, serviceIdentifier?: ServiceIdentifier<T>): T;
export function useContext<T>(context: React.Context<T|null|undefined>, serviceIdentifier?: ServiceIdentifier<T>): T {
  const ctx = React.useContext(context);
  if (ctx) {
    return ctx;
  } else if (serviceIdentifier && kernel.isBound(serviceIdentifier)) {
    return kernel.get<T>(serviceIdentifier);
  } else {
    throw new Error(`Failed to retrieve context, either through React.useContext() or IoC containter with service identifier '${serviceIdentifier?.toString()}'`);
  }
}