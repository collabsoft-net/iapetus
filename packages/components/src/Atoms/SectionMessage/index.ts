import type { Appearance } from '@atlaskit/section-message/dist/types/types';
import { appendChild, waitForAP } from '@collabsoft-net/helpers';

export const SectionMessage = async (title: string, replace: boolean, secondaryText = '', appearance: Appearance = 'information') => {
  const placeholder = document.createElement('div');
  const React = await import('react');
  const ReactDOM = await import('react-dom');
  const InlineMessage = await import('@atlaskit/section-message');
  await import('@atlaskit/css-reset');

  ReactDOM.render(
    React.createElement('div', {}, [
      React.createElement(InlineMessage.default, {
        title, appearance, children: [
          React.createElement('p', {}, secondaryText)
      ]})
    ]), placeholder);

  appendChild(placeholder, replace);

  const AP = await waitForAP();
  AP.resize('100%', `${placeholder.clientHeight}px`);
};