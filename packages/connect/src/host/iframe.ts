import type { Message,ResizeRequest } from '../client/Types';
import { Host } from '../Host';

export const resize = (event: MessageEvent, AC: Host): void => {
  const frame = AC.findSource(event);
  if (frame) {

    const { data } = event.data as unknown as Message<ResizeRequest>;
    const { width, height } = data || {};
    if (width && height) {
      frame.setAttribute('width', width);
      frame.setAttribute('height', height);
    }

    // TODO: this is a hack.
    // Basically it should be changed to detect whether the dialog has fixed width/height
    // or whether the dialog should resize based on content
    // const dialogId = frame.getAttribute('data-dialogid');

    // if (frame.getAttribute('data-fullscreen') === 'true') {
    //   frame.setAttribute('width', '100%');
    //   frame.setAttribute('height', '100%');
    // } else if (dialogId !== 'ac-polyfill-macroeditor') {
    //   frame.setAttribute('width', width);
    //   frame.setAttribute('height', height);
    // }
  }
};

export const sizeToParent = (event: MessageEvent, AC: Host): void => {
  const frame = AC.findSource(event);
  const parent = frame?.parentElement;
  if (parent) {
    frame.setAttribute('width', `${parent.scrollWidth}px`);
    frame.setAttribute('height', `${parent.scrollHeight}px`);
  }
}