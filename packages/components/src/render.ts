import 'arrive';
import 'reflect-metadata';

import { isOfType } from '@collabsoft-net/helpers';
import { EntryPoint, ExecutionPoint,Props } from '@collabsoft-net/types';
import React, { PropsWithChildren } from 'react';
import { createRoot } from 'react-dom/client';

interface ExtendedDocument extends Document {
  arrive: (selector: string, callback: (rootElem: Element) => Promise<void>) => void;
}

const bind = async (entrypoint: EntryPoint<Props>|ExecutionPoint, rootElem: Element, callback?: () => void, container?: React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>) => {
  const selector = entrypoint.selector || `#${entrypoint.name}`;
  rootElem = rootElem || document.querySelector(selector);
  const props = {} as Props;

  if (isOfType<ExecutionPoint>(entrypoint, 'execute')) {
    entrypoint.execute(rootElem);
    if (callback) callback();
  } else {
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

    const element = await entrypoint.getElement(props);
    const app = container ? React.createElement(container, { children: element }) : element;
    createRoot(rootElem).render(app);

    if (callback) {
      callback();
    }
  }
};

export const render = async (modules: Array<EntryPoint<Props>|ExecutionPoint>, container?: React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>, callback?: () => void, timeout: number = 2000): Promise<boolean> => {

  // Register application entrypoints for rendering
  const pendingModules: Array<Promise<void>> = modules.map((entrypoint) => new Promise<void>((resolve) => {
    const selector = entrypoint.selector || `#${entrypoint.name}`;

    // Prevent a page load race condition by checking if the element already exists
    const rootElm = document.querySelector(selector);
    if (rootElm) {
      bind(entrypoint, rootElm, () => {
        if (callback) {
          callback();
        }
        resolve();
      }, container);
    } else {
      (document as ExtendedDocument).arrive(selector, async (rootElem: Element) => {
        await bind(entrypoint, rootElem, () => {
          if (callback) {
            callback();
          }
          resolve();
        }, container);
      });
    }
  }));

  return Promise
    .race([ ...pendingModules, new Promise<void>((_, reject) => setTimeout(reject, timeout)) ])
    .then(() => true)
    .catch(() => false);
};