/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import 'wr-dependency!com.atlassian.auiplugin:dialog2';

import { isOfType } from '@collabsoft-net/helpers';

import type { Message } from '../client/Types';
import { DialogButtonRequest, DialogCloseRequest } from '../client/Types';
import { BadRequestError, Host } from '../Host';

const windowWithAJS = window as unknown as Window & { AJS: any };
const eventHandlers = new Map<string, () => void>();

const getSize = (options: AP.DialogOptions<never>) => {
  switch (options.size) {
    case 'small': return 'aui-dialog2-small';
    case 'medium': return 'aui-dialog2-medium';
    case 'large': return 'aui-dialog2-large';
    case 'x-large': return 'aui-dialog2-xlarge';
    case 'fullscreen': return true;
    default: return (options.width && options.height) ? false : 'aui-dialog2-medium';
  }
}

export const DialogCreateEventHandler = (message: Message<AP.DialogOptions<never>>, AC: Host) => {
    const { originId, data: instanceOptions } = message;
    const { baseUrl } = AC.options;
    if (!instanceOptions) throw new BadRequestError();

    // Check if the instance has been defined on the host options
    const instance = AC.options.dialogs ? AC.options.dialogs[instanceOptions.key] : null;
    if (!instance) throw new BadRequestError();

    const options = { ...instance.options, ...instanceOptions };

    const urlPrefix = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    let url = instance.url.startsWith('/') ? `${urlPrefix}${instance.url}` : instance.url;

    const defaultQueryString = `xdm_e=${AC.options.xdm_e}&cp=${AC.options.contextPath}&lic=${AC.options.license}&xdm_c=DO_NOT_USE&cv=DO_NOT_USE`;
    url += url.includes('?') ? `&${defaultQueryString}` : `?${defaultQueryString}`;

    const size = getSize(options);
    const sizeClass = typeof size !== 'boolean' ? size : '';
    let dialogStyle = typeof size === 'boolean'
      ? size ? 'width:100%;height:100%;' : `width:${options.width};height:${options.height};`
      : '';

    // Override `top` position of modal in case of full screen
    if (options.height && (options.height === '100%' || options.height === '100vh')) {
      dialogStyle += 'top:0px;'
    }

    const template = `
<section id="ap-dialog-${originId}" role="dialog" ${options.closeOnEscape === false ? 'data-aui-modal="true"' : ''} class="aui-layer aui-dialog2 ap-aui-dialog2 ${sizeClass}" aria-hidden="false" tabindex="-1" aria-labelledby="static-dialog--heading" style=${dialogStyle}>
    ${options.chrome ? `
      <header class="aui-dialog2-header">
          <h1 class="aui-dialog2-header-main" id="static-dialog--heading">${options.header}</h1>
          <button class="aui-close-button" type="button" aria-label="close"></button>
      </header>
    ` : ''}
    <div class="aui-dialog2-content" style="padding:0;font-size:0;max-height:unset;">
      <iframe id="ap-dialog-${originId}-frame" data-ap-origin=${originId} data-ap-appkey="${AC.options.appKey}" src="${url}" style="height:100%;width:100%;border:none;" name="${encodeURIComponent(JSON.stringify(options))}"></iframe>
    </div>
    ${options.chrome ? `
      <footer class="aui-dialog2-footer">
          <div class="aui-dialog2-footer-actions">
            ${options.buttons ? options.buttons.map(button => `
              <button id=ap-dialog-${originId}-${button.identifier}-button" class="aui-button">${button.text}</button>
            `) : `
              <button id=ap-dialog-${originId}-cancel-button" class="aui-button">${ options.cancelText }</button>
              <button id=ap-dialog-${originId}-submit-button" class="aui-button aui-button-primary">${options.submitText}</button>
            `}
          </div>
          <div class="aui-dialog2-footer-hint">${options.hint}}</div>
      </footer>
    ` : ''}
</section>    
    `;

    const html = document.createRange().createContextualFragment(template);
    document.body.appendChild(html);

    // Emit 'dialog.close' event when the dialog is hidden
    const dialog = windowWithAJS.AJS.dialog2(`#ap-dialog-${originId}`);
    dialog.show();

    // Register event handlers for all buttons & trigger them when clicked
    [ 'submit', 'cancel', ...options.buttons?.map(item => item.identifier) || [] ].forEach(identifier => {
      const button = document.getElementById(`ap-dialog-${originId}-${identifier}-button`) as HTMLButtonElement|null;
      if (button) {
        button.onclick = () => {
          // Fire generic dialog.button.click event
          AC.emit(originId, 'dialog.button.click', { button: { name: identifier } });
          // Fire event for each of the button `bind` event handlers
          eventHandlers.forEach(value => value());
          // Close the dialog if the submit button is clicked
          if (identifier === 'submit') {
            dialog.remove();
          }
        };
      }
    })
}

/*
* Event handler for AP.dialog.close()
*
* Dialogs are created with AP.dialog.create() and can be created in every connect iframe
* AP.dialog.close() will close the created dialog, but it works in mysterious ways
*
* So here are a few caveats to take into considerations:
* - `AP.dialog.close()` does not respect which app created the dialog. It will close any open dialog
* - `AP.dialog.close()`, when invoked from a non-dialog frame, will close the last instance of `.ap-aui-dialog2` in the DOM tree
* - `AP.dialog.close()`, when invoked from a dialog frame, will close itself AND all next sibling instances of `.ap-aui-dialog2`
* - `AP.dialog.close()` will only fire the `dialog.close` event when invoked from the dialog frame, and only for that dialog, not for any other dialog that get's closed
*
*/
export const DialogCloseEventHandler = (event: MessageEvent<unknown>, AC: Host) => {

  const message = AC.toMessage<Message<DialogCloseRequest<never>>>(event);

  const frame = AC.findSource(event);
  if (!frame) throw new BadRequestError();

  const originId = frame.getAttribute('data-ap-origin');
  if (!originId) throw new BadRequestError();

  // Check if the event is called from an opened dialog
  const dialog = frame.closest('.ap-aui-dialog2');
  if (dialog) {

    // We should remove all sibling instances of .ap-aui-dialog2
    const siblings = [];
    let elm: ChildNode|null = dialog;
    while (elm) {
      if (
        isOfType<Element>(elm, 'matches') && elm.matches('.ap-aui-dialog2') ||
        isOfType<Element>(elm, 'classList') && elm.classList.contains('ap-aui-dialog2')
      ) {
        siblings.push(elm);
      }
      elm = elm.nextSibling;
    }

    // We should remove the dialog itself and all siblings
    [ dialog, ...siblings ].forEach(item => {
      const instance = windowWithAJS.AJS.dialog2(item);
      if (instance) {
        instance.remove();
      }
    });

    // Now emit the event to all app iframes
    AC.emit(originId, 'dialog.close', message.data);

  // If this is not invoked by the calling dialog, we should close the last opened dialog
  } else {
    const dialogs = document.querySelectorAll('.ap-aui-dialog2');
    const dialog = dialogs.item(dialogs.length);
    if (dialog) {
      const instance = windowWithAJS.AJS.dialog2(dialog);
      if (instance) {
        instance.remove();
      }
      AC.emit(originId, 'dialog.close', message.data);
    }
  }
}

export const DialogCustomDataEventHandler = (event: MessageEvent<unknown>, AC: Host) => {
  try {
    const frame = AC.findSource(event);
    if (frame) {
      const metadata = frame.getAttribute('name');
      if (metadata) {
        const result = JSON.parse(decodeURIComponent(metadata)) as AP.DialogOptions<never>;
        AC.reply(event, result.customData);
      }
    }
  } catch (ignored) {
    //Ignore
  }
}

export const DialogButtonEventHandler = (event: MessageEvent<unknown>, AC: Host): void => {
  const message = AC.toMessage<DialogButtonRequest>(event);
  const { originId, data } = message;
  if (!data) throw new BadRequestError();

  const { name, action } = data;
  const button = document.getElementById(`ap-dialog-${originId}-${name}-button`) as HTMLButtonElement|null;
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
    eventHandlers.set(originId, () => AC.reply(event));
  }
}
