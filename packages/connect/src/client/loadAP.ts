
const windowWithAP = window as unknown as Window & { AP: AP.Instance };

export const loadAP = async (options: {
  resize: boolean;
  sizeToParent: boolean;
  margin: boolean;
  base: boolean;
} = {
  resize: true,
  sizeToParent: false,
  margin: true,
  base: false
}): Promise<AP.Instance> => {
  const resize = new Boolean(options.resize).toString();
  const sizeToParent = new Boolean(options.sizeToParent).toString();
  const margin = new Boolean(options.margin).toString();
  const base = new Boolean(options.base).toString();
  const iframeOptions = `resize:${resize};sizeToParent:${sizeToParent};margin:${margin};base:${base}`;

  return new Promise<AP.Instance>((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = async function() {
      let count = 0;
      while (!windowWithAP.AP || count > 10) {
        await new Promise((retry) => setTimeout(retry, 200));
        count++;
      }

      if (!windowWithAP.AP) {
        reject(new Error('Atlassian Javascript API (AP) is not available'));
      } else {
        resolve({ ...windowWithAP.AP });
      }
    };
    script.onerror = reject;
    script.setAttribute('data-options', iframeOptions);
    script.setAttribute('type', 'application/javascript');
    script.src = 'https://connect-cdn.atl-paas.net/all.js';
    document.head.appendChild(script);
  });
};
