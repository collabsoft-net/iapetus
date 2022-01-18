
export const findSource = (source: Window): HTMLFrameElement|null => {
  if (!source) return null;

  let frame: HTMLFrameElement|null = null;
  const frames = document.querySelectorAll('IFRAME[data-ac-polyfill]');

  // detect the source for IFRAMEs with same-origin URL
  frames.forEach(element => {
      if (frame == null) {
          const { contentWindow } = element as HTMLFrameElement;
          if (contentWindow === source || contentWindow === (source as Window).parent) {
              frame = element as HTMLFrameElement;
              return;
          }
      }
  });

  return frame;
};

export const getFrame = async (): Promise<HTMLIFrameElement|null> => {
    let count = 0;
    let acFrame: HTMLIFrameElement|null = null;
    while (!acFrame && count <= 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        acFrame = document.querySelector('iframe[data-ac-polyfill]');
        count++;
    }
    return acFrame;
}

export const getFrameOptions = async (): Promise<HTMLDivElement|null|undefined> => {
    const frame = await getFrame();
    if (frame) {
        let count = 0;
        let  acFrameOptions: HTMLDivElement|null|undefined = null;
        while (!acFrameOptions && count <= 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            acFrameOptions = frame.contentDocument?.querySelector('#ac-iframe-options');
            count++;
        }
        return acFrameOptions || null;
    }
    return null;
}

export const getOptions = async (): Promise<AP.FrameOptions|null> => {
    const acFrameOptions = await getFrameOptions();
    if (acFrameOptions) {
        const acOptions = acFrameOptions.getAttribute('data-options');
        const options: AP.FrameOptions = {};
        acOptions?.split(';').forEach(item => {
            const parts = item.split(':');
            (options as Record<string, string>)[parts[0]] = parts[1];
        });
        return options;
    } else {
        console.log('[AC] There are no options defined on the iframe');
        return null;
    }
}