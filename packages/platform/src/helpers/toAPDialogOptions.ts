
export const toAPDialogOptions = (options?: Omit<Platform.DialogOptions<never, unknown>, 'key'>): Omit<AP.DialogOptions<unknown>, 'key'>|undefined => {
  if (options) {
    const dialogSize =
      options.size === 'xlarge'
        ? 'x-large'
        : options.size === 'max'
          ? 'fullscreen'
          : options.size;

    return {
      size: options.height || options.width ? undefined : dialogSize,
      width: options.width,
      height: options.height,
      closeOnEscape: options.closeOnEscape,
      chrome: false,
    }
  }
  return undefined
}