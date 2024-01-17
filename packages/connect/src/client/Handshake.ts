
import { Events } from './Events';
import { postMessage } from './PostMessage';
import { Message } from './Types';

export const Handshake = async (options: AP.FrameOptions) => {
  console.log('[AC] Establishing connection to Atlassian Connect polyfill');

  let count = 0;
  let connected = false;

  const responseHandler = ({ data: payload }: MessageEvent<string>) => {
    const response = payload as unknown as Message<never>;
    const { originId } = response;

    if (originId) {
      connected = true;
      console.log('[AC] Received handshake response, connection established');
      window.removeEventListener('message', responseHandler);
    }
  }

  window.removeEventListener('message', responseHandler);
  window.addEventListener('message', responseHandler);

  while (!connected && count < 50) {
    postMessage(Events.HANDSHAKE, options);
    await new Promise(resolve => setTimeout(resolve, 100));
    count++;
  }

  if (!connected) {
    console.error('[AC] Failed to initialize connection to Atlassian Connect polyfill');
  }

  window.removeEventListener('message', responseHandler);
}
