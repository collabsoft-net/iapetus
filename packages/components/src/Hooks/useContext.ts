
import kernel from '@collabsoft-net/inversify';
import type { ServiceIdentifier } from 'inversify';
import React from 'react';

export function useContext<T>(context: React.Context<T>, serviceIdentifier?: ServiceIdentifier<T>): T|null;
export function useContext<T>(context: React.Context<T|null>, serviceIdentifier?: ServiceIdentifier<T>): T|null;
export function useContext<T>(context: React.Context<T|undefined>, serviceIdentifier?: ServiceIdentifier<T>): T|null;
export function useContext<T>(context: React.Context<T|null|undefined>, serviceIdentifier?: ServiceIdentifier<T>): T|null {
  const ctx = React.useContext(context);
  if (ctx) {
    return ctx;
  } else if (serviceIdentifier && kernel.isBound(serviceIdentifier)) {
    return kernel.get<T>(serviceIdentifier);
  } else {
    return null;
  }
}