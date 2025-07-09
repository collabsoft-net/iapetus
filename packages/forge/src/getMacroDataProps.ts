import { view } from '@forge/bridge';

export const getMacroDataProps = async () => {
  const context = await view.getContext();
  return context.extension.type === 'macro'
    ? context.extension.config
    : {};
};
