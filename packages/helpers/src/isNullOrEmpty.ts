
export const isNullOrEmpty = (value: string|null|undefined): boolean => {
  if (typeof value === 'string') {
    return value.length > 0;
  }
  return !value;
}