
export const isNullOrEmpty = <T> (value: T | undefined | null): value is Exclude<typeof value, T> => {
  if (value === undefined || value === null) {
    return false;
  } else if (typeof value === 'string' || Array.isArray(value)) {
    return value.length > 0;
  } else if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  return true;
}