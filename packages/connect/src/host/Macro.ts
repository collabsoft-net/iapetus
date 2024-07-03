import { DialogButtonRequest, SaveMacroRequest, WindowWithMacroEditor } from '../client/Types';
import { BadRequestError, Host } from '../Host';

export const getMacroKeyFromFrame = (event: MessageEvent<unknown>, AC: Host) => {
  const frame = AC.findSource(event);
  return frame?.getAttribute('name') || null;
}

export const saveMacroEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const tinymce = (window as WindowWithMacroEditor).tinymce || {};
  if (!tinymce) throw new Error('Required global variable tinymce is not available');

  const key = getMacroKeyFromFrame(event, AC);
  if (!key) throw new BadRequestError();

  const message = AC.toMessage<SaveMacroRequest<Record<string, string>>>(event);
  if (typeof tinymce?.confluence?.macrobrowser?.macroBrowserComplete === 'function') {
    const bodyHtml = message.data?.macroBody || '';
    const params = message.data?.macroParameters || {};
    tinymce.confluence.macrobrowser.macroBrowserComplete({
      name: key,
      params,
      bodyHtml,
      defaultParameterValue: undefined
    });
    AC.editor.setMacroData(key, params);
    AC.editor.setMacroBody(key, bodyHtml);
  }
}

export const closeMacroEditorEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const key = getMacroKeyFromFrame(event, AC);
  if (!key) throw new BadRequestError();
  AC.editor.close(key);
}

export const getMacroDataEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const key = getMacroKeyFromFrame(event, AC);
  if (!key) throw new BadRequestError();

  const data = AC.editor.getMacroData(key);
  AC.reply(event, data);
}

export const getMacroBodyEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  const key = getMacroKeyFromFrame(event, AC);
  if (!key) throw new BadRequestError();

  const data = AC.editor.getMacroBody(key);
  AC.reply(event, data);
}

export const MacroEditorButtonEventHandler = (event: MessageEvent<unknown>, AC: Host): void => {
  const message = AC.toMessage<DialogButtonRequest>(event);
  const { originId, data } = message;
  if (!data) throw new BadRequestError();

  const key = getMacroKeyFromFrame(event, AC);
  if (!key) throw new BadRequestError();

  const { name, action } = data;
  const button = document.getElementById(`ap-macroeditor-${key}-${name}-button`) as HTMLButtonElement|null;
  if (!button) return;

  if (action === 'enable') {
    button.removeAttribute('disabled');
  } else if (action === 'disable') {
    button.setAttribute('disabled', 'true');
  } else if (action === 'isEnabled') {
    AC.reply(event, !button.hasAttribute('disabled'));
  } else if (action === 'toggle') {
    if (button.hasAttribute('disabled')) {
      button.removeAttribute('disabled');
    } else {
      button.setAttribute('disabled', 'true');
    }
  } else if (action === 'trigger') {
    button.click();
  } else if (action === 'isHidden') {
    AC.reply(event, button.classList.contains('hidden'));
  } else if (action === 'hide') {
    button.classList.add('hidden');
  } else if (action === 'show') {
    button.classList.remove('hidden');
  } else if (action === 'bind') {
    AC.editor.eventHandlers.set(originId, () => AC.reply(event));
  }
}

