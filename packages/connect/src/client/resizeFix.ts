import { waitForAP } from './waitForAP';

let scrollHeight = 0;

// Fix for incorrect iframe sizing
export const resizeFix = async (): Promise<void> => {
  const AP = await waitForAP();
  const refElement = document.querySelector('.ac-content') || document.body;

  if (AP && AP.resize) {
    new ResizeObserver(function() {
      if (scrollHeight !== refElement.scrollHeight) {
          scrollHeight = refElement.scrollHeight;
          AP.resize('100%', scrollHeight.toString() + 'px');
      }
    }).observe(refElement, {
        box: 'border-box'
    });
  }
};
