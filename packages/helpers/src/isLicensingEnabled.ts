

export const isLicensingEnabled = (shouldBeEnabled?: boolean): boolean => {
  let isLicensingEnabled = true;
  if (process.env.LICENSING_ENABLED !== undefined) {
    isLicensingEnabled = process.env.LICENSING_ENABLED === 'false' ? false : true;
  }
  return shouldBeEnabled === false ? false : isLicensingEnabled;
}