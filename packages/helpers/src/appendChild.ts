
export const appendChild = (child: Node, replace = true, parent: HTMLElement = document.body) => {
  if (replace) {
    while (parent.firstChild) { parent.removeChild(parent.firstChild); }
  }
  parent.appendChild(child);
};