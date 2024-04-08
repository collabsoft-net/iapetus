/* eslint-disable @typescript-eslint/no-explicit-any */

import { MacroEditorOptions, WindowWithMacroEditor } from '../client/Types';
import { Host, HostOptions } from '../Host';

const windowWithMacroEditor = window as WindowWithMacroEditor;

export class MacroEditor {

  public eventHandlers = new Map<string, () => void>();

  private options: HostOptions;
  private macroBody = new Map<string, string>();
  private macroData = new Map<string, Record<string, string>>();
  private active: boolean = false;
  private closeOnSubmitDisabled: boolean = false;

  constructor(private AC: Host) {
    this.options = AC.options;
  }

  public get isOpen() {
    return this.active;
  }

  public async init() {
    if (this.options.editors) {
      const macroBrowserAvailable = await this.waitForMacroBrowser();
      if (macroBrowserAvailable) {
        Object.entries(this.options.editors).forEach(([ key, options ]) => {
          windowWithMacroEditor.AJS.MacroBrowser.setMacroJsOverride(key, {
            opener: (macroData: { name: string, schemaVersion: number, body: string, params: Record<string, string> }) => {
              const body = macroData.body || '';
              const params = macroData.params || {};
              const name = Object.keys(params).length <= 0 ? options.insertTitle : options.editTitle || macroData.name;
              this.macroBody.set(key, body);
              this.macroData.set(key, params);
              this.open(key, name || key, params, options);
            }
          });
        });
      }
    }
  }

  public getMacroBody(key: string) {
    return this.macroBody.get(key) || {};
  }

  public setMacroBody(key: string, body: string) {
    this.macroBody.set(key, body);
  }

  public getMacroData(key: string) {
    return this.macroData.get(key) || {};
  }

  public setMacroData(key: string, params: Record<string, string>) {
    this.macroData.set(key, params);
  }

  public disableCloseOnSubmit() {
    this.closeOnSubmitDisabled = true
  }

  public close(key: string, isCancelled?: boolean) {
    const dialog = windowWithMacroEditor.AJS.dialog2(`#ap-macroeditor-${key}`);
    if (dialog) {
      if (isCancelled) {
        windowWithMacroEditor.tinymce.confluence.macrobrowser.macroBrowserCancel();
      }
      dialog.remove();
      this.active = false;
    }
  }

  private open = (key: string, name: string, params: Record<string, string>, options: MacroEditorOptions) => {

    const isEditing = Object.keys(params).length > 0;
    const style = `width:${options.width || '50%'};height:${options.height || '50%'};z-index: 3000`;
    let url = options.url.startsWith('/') ? `${this.options.servletPath}/embed/${this.options.appKey}/${key}${options.url}` : options.url;

    const defaultQueryString = `xdm_e=${this.options.baseUrl}&cp=${this.options.contextPath}&lic=${this.options.license}&xdm_c=DO_NOT_USE&cv=DO_NOT_USE`;
    url += url.includes('?') ? `&${defaultQueryString}` : `?${defaultQueryString}`;

    const template = `
      <section id="ap-macroeditor-${key}" role="dialog" class="aui-layer aui-dialog2 ap-aui-dialog2 " aria-hidden="false" tabindex="-1" aria-labelledby="static-dialog--heading" style="${style}">
        <header class="aui-dialog2-header">
          <h2 class="aui-dialog2-header-main" id="static-dialog--heading">${name}</h2>
        </header>
        <div class="aui-dialog2-content">
          <iframe id="ap-macroeditor-${key}-frame" data-ap-appkey="${this.options.appKey}" src="${url}" style="width:100%;height:100%;border:none;" name="${key}"></iframe>
        </div>
        <footer class="aui-dialog2-footer">
          <div class="aui-dialog2-footer-actions">
            <button id="ap-macroeditor-${key}-submit-button" class="aui-button aui-button-primary">${ isEditing ? 'Submit' : 'Insert' }</button>
            <button id="ap-macroeditor-${key}-cancel-button" class="aui-button aui-button-link">Cancel</button>
          </div>
        </footer>
      </section>    
    `;

    const html = document.createRange().createContextualFragment(template);
    document.body.appendChild(html);

    // Emit 'dialog.close' event when the dialog is hidden
    const dialog = windowWithMacroEditor.AJS.dialog2(`#ap-macroeditor-${key}`);
    dialog.show();
    this.active = true;

    // Register event handlers for all buttons & trigger them when clicked
    [ 'submit', 'cancel' ].forEach(identifier => {
      const button = document.getElementById(`ap-macroeditor-${key}-${identifier}-button`) as HTMLButtonElement|null;
      if (button) {
        button.onclick = () => {
          // Fire generic dialog.button.click event
          this.AC.emit(key, 'dialog.button.click', { button: { name: identifier } });
          // Fire event for each of the button `bind` event handlers
          this.eventHandlers.forEach(value => value());
          // Close the dialog if applicable
          if (identifier !== 'submit' || !this.closeOnSubmitDisabled) {
            this.close(key);
          }
        };
      }
    })
  }

  private async waitForMacroBrowser(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let count = 0;
      const interval = setInterval(() => {
        if (windowWithMacroEditor.AJS.MacroBrowser && windowWithMacroEditor.AJS.MacroBrowser.setMacroJsOverride) {
          clearInterval(interval);
          resolve(true);
        } else if (count > 120) {
          clearInterval(interval);
          resolve(false);
        }
        count++;
      }, 500);
    });
  }

}


/*
import 'arrive';
import './helpers/tinymce';
import './connect';

export interface WindowWithTinyMCE extends Window {
  tinymce?: unknown;
}

import { WindowWithTinyMCE } from '../interfaces';


import Button, { ButtonGroup } from '@atlaskit/button';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Column, Grid, Header, Row } from '@collabsoft-net/components';
import { getDialogButtonEventHandlers, sendDialogResponse, setCloseMacroEditorEventHandler, setDialogButtonEvent, setMacroData, setSaveMacroEventHandler } from '@collabsoft-net/connect';
import AJS from 'AJS';
import { dialogs } from 'API/constants/dialogs';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import tinymce from 'tinymce';

import { getUrl } from './helpers/confluence';

const MACRO_KEY = 'figma';

const ModalContainer = styled(Grid)`
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
  flex: 1 1 auto;
  padding: 0;
`;

const ModalHeader = styled(Row)`
  border-bottom: 1px solid #ccc;
  height: 69px;
  padding: 22px 20px;
  background: #f5f5f5;
  border-radius: 5px 5px 0 0;
`;

const ModalFooter = styled(Row)`
  border-top: 1px solid #ccc;
  height: 51px;
  padding: 10px 20px;
  background: #f5f5f5;
  border-radius: 0 0 5px 5px;
`;

const ModalBody = styled(Row)``;

const ModalHeading = styled(Header)`
  margin-top: 0;
`;

const DialogFrame = styled.iframe`
  border:none;
  width: 100%;
`;

setSaveMacroEventHandler((params: unknown, bodyHtml: string) => {
  tinymce.confluence.macrobrowser.macroBrowserComplete({
    name: MACRO_KEY,
    params,
    bodyHtml,
    defaultParameterValue: undefined
 });
});

const MacroEditorModal = ({ name, module }: { name: string, module: string }) => {
  const [ isOpen, setOpen ] = useState<boolean>(true);
  const [ isSubmitDisabled, setSubmitDisabled ] = useState<boolean>(false);
  const [ isCancelDisabled, setCancelDisabled ] = useState<boolean>(false);
  const [ isDisableCloseOnSubmit, setDisableCloseOnSubmit ] = useState(false);

  const onCancel = () => {
    const handlers = getDialogButtonEventHandlers('cancel');
    handlers.forEach(event => sendDialogResponse(event));

    setOpen(false);
    tinymce.confluence.macrobrowser.macroBrowserCancel();
  };

  const onSubmit = () => {
    const handlers = getDialogButtonEventHandlers('submit');
    handlers.forEach(event => sendDialogResponse(event));
    if (!isDisableCloseOnSubmit) {
      setOpen(false);
    }
  };

  setDialogButtonEvent((event: MessageEvent) => {
    const { type, name, action } = JSON.parse(event.data);
    if (type === 'submit' && action === 'disable') setSubmitDisabled(true);
    if (type === 'submit' && action === 'enable') setSubmitDisabled(false);
    if (type === 'cancel' && action === 'disable') setCancelDisabled(true);
    if (type === 'cancel' && action === 'enable') setCancelDisabled(false);
    if (name === 'disableCloseOnSubmit') setDisableCloseOnSubmit(true);
  });

  setCloseMacroEditorEventHandler(() => {
    setOpen(false);
  });

  return (
    <ModalTransition>
      { isOpen && (
        <Modal onClose={ onCancel } shouldCloseOnEscapePress={ true } width={ 'x-large' } height='600px'>
          <ModalContainer fluid>
            <ModalHeader>
              <ModalHeading weight='h600'>{ name }</ModalHeading>
            </ModalHeader>
            <ModalBody stretched>
              <DialogFrame width='100%' height='100%' src={getUrl(`/plugins/servlet/app.figma/ac?s=${module}`)} data-ac-polyfill data-dialogid='ac-polyfill-macroeditor' data-macroid='ac-polyfill-macroeditor'></DialogFrame>
            </ModalBody>
            <ModalFooter>
              <Grid fluid vertical>
                <Column stretched></Column>
                <Column>
                  <ButtonGroup>
                    <Button onClick={ onSubmit } appearance='primary' isDisabled={isSubmitDisabled}>Insert</Button>
                    <Button onClick={ onCancel } appearance='link' isDisabled={isCancelDisabled}>Cancel</Button>
                  </ButtonGroup>
                </Column>
              </Grid>
            </ModalFooter>
          </ModalContainer>
        </Modal>
      )}
    </ModalTransition>
  );
};

const createDialog = (name: string, module: string) => {
  const modalContainer = document.getElementById(`ac-polyfill-macroeditor`) || document.createElement('div');
  ReactDOM.render(<MacroEditorModal name={ name } module={ module } />, modalContainer);
};

const bindCustomEditor = () => {
  AJS.MacroBrowser.setMacroJsOverride(MACRO_KEY, {
    opener: function(macroData: { name: string, schemaVersion: number, body: string, params: Record<string, unknown> }) {
      setMacroData(macroData.params || {});
      createDialog('Figma for Confluence', dialogs['figma-embed-for-confluence']);
    }
  });
};

(() => {
  let count = 0;
  const interval = setInterval(() => {
    if (AJS.MacroBrowser && AJS.MacroBrowser.setMacroJsOverride) {
      clearInterval(interval);
      bindCustomEditor();
    } else if (count > 120) {
      clearInterval(interval);
    }
    count++;
  }, 500);
})();
*/