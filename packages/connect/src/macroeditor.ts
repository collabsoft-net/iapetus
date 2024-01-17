/*
import 'arrive';
import './helpers/tinymce';
import './connect';

export interface WindowWithTinyMCE extends Window {
  tinymce?: unknown;
}

import { WindowWithTinyMCE } from '../interfaces';

(window as WindowWithTinyMCE).tinymce = (window as WindowWithTinyMCE).tinymce || {};

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