
export const isNullOrEmpty = (value?: string): boolean => {
  if (typeof value === 'string') {
    return value.length > 0;
  }
  return !value;
}