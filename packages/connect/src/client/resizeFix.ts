import { waitForAP } from './waitForAP';

// Fix for incorrect iframe sizing
export const resizeFix = async (): Promise<void> => {
  const AP = await waitForAP();
  const refElement = document.querySelector('.ac-content') || document.body;

  if (AP && AP.resize) {
    let scrollHeight = 0;

    const onResize = () => {
      if (scrollHeight !== refElement.scrollHeight) {
        scrollHeight = refElement.scrollHeight;
        AP.resize('100%', scrollHeight.toString() + 'px');
      }
    };

    new MutationObserver(onResize).observe(refElement, {
      attributes: true,
      childList: true,
      subtree: true
    });

    onResize();
  }
};
