
export const isProduction = (): boolean => typeof process.env.NODE_ENV === 'string' && process.env.NODE_ENV.toLowerCase() === 'production';