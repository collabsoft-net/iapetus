
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