import 'arrive';
import 'reflect-metadata';

import { EntryPoint, Props } from '@collabsoft-net/types';
import React, { PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';

interface ExtendedDocument extends Document {
  arrive: (selector: string, callback: (rootElem: Element) => Promise<void>) => void;
}

const bind = async (entrypoint: EntryPoint<Props>, rootElem: Element, callback?: () => void, container?: React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>) => {
  const selector = entrypoint.selector || `#${entrypoint.name}`;
  rootElem = rootElem || document.querySelector(selector);
  const props = {} as Props;

  rootElem
    .getAttributeNames()
    .filter((attributeName) => attributeName.startsWith('data'))
    .forEach((attributeName) => {
      const name = attributeName.substring(5);
      const value = rootElem.getAttribute(attributeName);
      if (value) {
        if (name === 'state' || name === 'mockstate') {
          const decoded = Buffer.from(value, 'base64').toString('utf-8');
          props[name] = JSON.parse(decoded);
        } else {
          props[name] = value;
        }
      }
    });

  const element = await (<EntryPoint<Props>>entrypoint).getElement(props);

  const app = container ? React.createElement(container, { children: element }) : element;

  ReactDOM.render(app, rootElem, () => {
    if (callback) callback();
  });
};

export const render = async (modules: Array<EntryPoint<Props>>, callback?: () => void, container?: React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>): Promise<void> => {
  // Register application entrypoints for rendering
  modules.forEach((entrypoint) => {
    const selector = entrypoint.selector || `#${entrypoint.name}`;

    // Prevent a page load race condition by checking if the element already exists
    const rootElm = document.querySelector(selector);
    if (rootElm) {
      bind(entrypoint, rootElm, callback, container);
    } else {
      (document as ExtendedDocument).arrive(selector, async (rootElem: Element) => {
        await bind(entrypoint, rootElem, callback, container);
      });
    }
  });
};