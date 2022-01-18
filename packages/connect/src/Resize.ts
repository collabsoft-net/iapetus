import { ResizeObserver } from '@juggle/resize-observer';

import { findSource } from './iframe';

export const resize = ({ source, data }: MessageEvent): void => {
  const { width, height } = JSON.parse(data);
  const parent = findSource(source as Window);
  if (parent) {
    // TODO: this is a hack.
    // Basically it should be changed to detect whether the dialog has fixed width/height
    // or whether the dialog should resize based on content
    const dialogId = parent.getAttribute('data-dialogid');

    if (parent.getAttribute('data-fullscreen') === 'true') {
      parent.setAttribute('width', '100%');
      parent.setAttribute('height', '100%');
    } else if (dialogId !== 'ac-polyfill-macroeditor') {
      parent.setAttribute('width', width);
      parent.setAttribute('height', height);
    }
  }
};

export const getResizeObserver = async (): Promise<typeof ResizeObserver> => {
  if ('ResizeObserver' in window === false) {
    // Loads polyfill asynchronously, only if required.
    const { ResizeObserver } = await import('@juggle/resize-observer');
    return ResizeObserver;
  } else {
    return window['ResizeObserver'] as typeof ResizeObserver;
  }
};

export const sizeToParent = ({ source }: MessageEvent|{ source: Window }): void => {
  const frame = findSource(source as Window);

  if (frame) {
    const parent = frame?.parentElement;
    if (parent) {
      frame.setAttribute('width', `${parent.scrollWidth}px`);
      frame.setAttribute('height', `${parent.scrollHeight}px`);
    }
  }
}