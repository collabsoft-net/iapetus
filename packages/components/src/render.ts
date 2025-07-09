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

export async function render(modules: Array<EntryPoint<Props>|ExecutionPoint>, container?: React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>): Promise<void>;
export async function render(modules: Array<EntryPoint<Props>|ExecutionPoint>, callback?: () => void, container?: React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>): Promise<void>;
export async function render(modules: Array<EntryPoint<Props>|ExecutionPoint>, callbackOrContainer?: (() => void)|React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>, container?: React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>): Promise<void> {

  const callback = !isOfType<React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>>(callbackOrContainer, 'displayName') ? callbackOrContainer : () => {};
  container = isOfType<React.ComponentClass<PropsWithChildren<unknown>>|React.FunctionComponent<PropsWithChildren<unknown>>>(callbackOrContainer, 'displayName') ? callbackOrContainer : container;

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