import React from 'react'

export function isTrustedEvent<T extends React.SyntheticEvent|MouseEvent>(handler?: (event: T) => void): (event: T) => void {
  return (event: T) => {
    if (event.isTrusted) {
      handler && handler(event);
    }
  }
}

