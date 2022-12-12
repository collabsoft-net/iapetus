import React from 'react'

export const isTrustedEvent = <T extends React.SyntheticEvent> (handler?: React.EventHandler<T>) => {
  return (event: T) => {
    if (event.isTrusted) {
      handler && handler(event);
    }
  }
}