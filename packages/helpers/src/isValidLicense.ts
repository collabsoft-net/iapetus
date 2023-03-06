import { isProduction } from './isProduction'

export const isValidLicense = () => {
  const query = new URLSearchParams(window.location.search);
  const lic = query.get('lic');
  return (!isProduction() || (typeof lic === 'string' && lic === 'active'));
}