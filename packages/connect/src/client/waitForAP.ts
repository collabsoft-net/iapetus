
const windowWithAP = window as unknown as Window & { AP: AP.Instance };

export const waitForAP = async (): Promise<AP.Instance> => {
  let count = 0;
  while (!windowWithAP.AP || count > 10) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    count++;
  }
  if (!windowWithAP.AP) {
    throw new Error('Atlassian Javascript API (AP) is not available, please verify if you have added a reference to `all.js`');
  }
  return { ...windowWithAP.AP };
};
