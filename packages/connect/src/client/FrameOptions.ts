


export const getFrameOptions = (): AP.FrameOptions => {
  const optionsFromAttributes = getOptionsFromAttributes();

  const options: AP.FrameOptions = {};
  optionsFromAttributes.split(';').forEach(item => {
      const parts = item.split(':');
      (options as Record<string, string>)[parts[0]] = parts[1];
  });

  return options;
}

const getOptionsFromAttributes = () => {
  const parent = document.currentScript;
  const optionsFromScript = parent?.getAttribute('data-options') || '';
  if (optionsFromScript) {
    return optionsFromScript;
  }

  const element = document.querySelector('#ac-iframe-options');
  const optionsFromElement = element?.getAttribute('data-options') || '';
  if (optionsFromElement) {
    return optionsFromElement;
  }

  return '';
}
