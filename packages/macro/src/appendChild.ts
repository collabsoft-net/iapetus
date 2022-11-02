import { removeChildren } from './removeChildren';

export const appendChild = (child: Node, replace = true, parent: HTMLElement = document.body) => {
  if (replace) {
    removeChildren(parent);
  }
  parent.appendChild(child);
};