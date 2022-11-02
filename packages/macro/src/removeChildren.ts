
export const removeChildren = (parent: HTMLElement = document.body) => {
  while (parent.firstChild) { parent.removeChild(parent.firstChild); }
};