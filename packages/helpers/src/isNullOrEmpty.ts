
export const isNullOrEmpty = (value: string | string[] | undefined | null): boolean => {
  if (value === undefined || value === null) {
    return true;
  } else {
    return value.length <= 0;
  }
}