
export const getMacroData = <T extends Record<string, string|number|boolean|undefined>> (keys: Array<string>, transformer?: (key: string, value: string|number|boolean|undefined) => string|number|boolean|undefined): T => {
  const query = new URLSearchParams(window.location.search);
  return keys.reduce((result: Record<string, string|number|boolean|undefined>, key) => {
    const value = query.get(key);
    if (value) {
      result[key] = transformer ? transformer(key, value) : value;
    }
    return result;
  }, {}) as T;
};
