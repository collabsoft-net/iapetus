
export const camelCase = (value: string): string => value && value.length > 1 ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;
