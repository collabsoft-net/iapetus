/* eslint-disable @typescript-eslint/ban-ts-comment */
import Modal, { ModalBody, ModalHeader, ModalTransition } from '@atlaskit/modal-dialog';
import { ConnectHelper } from '@collabsoft-net/types';
import qs from 'query-string';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled, { injectGlobal } from 'styled-components';

import { findSource } from './iframe';
import { SupportedEvents } from './SupportedEvents';

const dialogCustomData = new Map<string, unknown>();
const dialogButtonEventHandlers = new Map<'submit'|'cancel', Array<MessageEvent>>();
let dialogButtonEvent: (event: MessageEvent) => void = () => {};

const DialogFrame = styled.iframe`
  border:none;
  width: 100%;
`;

export const processDialogEvent = (event: MessageEvent, dialogs: Record<string, string>, { getUrl, getServletPattern }: ConnectHelper): void => {
    const { eventType, name, action, type } = JSON.parse(event.data);
    switch (eventType) {

        case SupportedEvents.DIALOG_CREATE:
            createDialog(event, dialogs, { getUrl, getServletPattern });
            break;

        case SupportedEvents.DIALOG_EVENT:
            if (name === 'button' && action === 'bind') {
                addDialogButtonEventHandler(type, event);
            } else if (name === 'button' && action === 'enable') {
                dialogButtonEvent(event);
            } else if (name === 'button' && action === 'disable') {
                dialogButtonEvent(event);
            } else if (name === 'disableCloseOnSubmit') {
                dialogButtonEvent(event);
            } else if (name === 'getCustomData') {
                getCustomData(event);
            } else if (name === 'close') {
                closeDialog(event);
            } else if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() !== 'production') {
                console.log('[AC] Received unsupport event', event);
            }
            break;
    }
};

export const createDialog = ({ source, data }: MessageEvent, dialogs: Record<string, string>, { getUrl, getServletPattern }: ConnectHelper): void => {
    const { dialogId, options } = JSON.parse(data);
    const { key, customData, size, closeOnEscape, chrome, header, width, height } = options as AP.DialogOptions<unknown>;

    dialogCustomData.set(dialogId, customData);
    const modalContainer = document.getElementById(`ac-polyfill-dialog-${dialogId}`) || document.createElement('div');
    modalContainer.setAttribute('id', `ac-polyfill-dialog-${dialogId}`);
    document.body.appendChild(modalContainer);

    const notifyWhenClosed = () => {
        const frame = findSource(source as Window);
        if (frame && frame.contentWindow) {
            frame.contentWindow.postMessage({ eventType: SupportedEvents.DIALOG_EVENT, target: `${dialogId}_close` }, '*');
        }
        document.body.removeChild(modalContainer);
    };

    const query = qs.parse(window.location.search);
    query['s'] = dialogs[key];
    query['baseUrl'] = getUrl('');
    const querystring = Object.entries(query).map(([key, value]) => `${key}=${value}`).join('&');

    const ModalComponent: React.FC = () => {
        const [ isOpen, setOpen ] = useState(true);

        return isOpen ? React.createElement(ModalTransition, {}, [
            React.createElement(Modal, {
                onClose: () => {
                    notifyWhenClosed();
                    setOpen(false);
                },
                shouldCloseOnEscapePress: closeOnEscape,
                height: height ? height : size === 'fullscreen' ? '100%' : undefined,
                width: width ? width : size === 'fullscreen' ? '100%' : size
            }, chrome ? [
                    ...header ? [ React.createElement(ModalHeader, {}, [ header ])] : [],
                    React.createElement(ModalBody, {
                        children: [
                            React.createElement(DialogFrame, {
                                src: getUrl(`/plugins/servlet/${getServletPattern()}?${querystring}`),
                                // @ts-ignore
                                'data-ac-polyfill': '',
                                'data-dialogid': dialogId,
                                'data-fullscreen': size === 'fullscreen' ? 'true' : 'false'
                            })
                        ]
                    }, [])
                ] : [
                    React.createElement(DialogFrame, {
                        src: getUrl(`/plugins/servlet/${getServletPattern()}?${querystring}`),
                        // @ts-ignore
                        'data-ac-polyfill': '',
                        'data-dialogid': dialogId,
                        'data-fullscreen': size === 'fullscreen' ? 'true' : 'false'
                    })
                ])
        ]) : React.createElement('div');
    };

    injectGlobal`
        .atlaskit-portal div[role="presentation"] > div {
            width: inherit;
        }
    `;

    ReactDOM.render(React.createElement(ModalComponent), modalContainer);
};

export const closeDialog = ({ source, data }: MessageEvent): void => {
    const frame = findSource(source as Window);
    if (frame) {
        const dialogId = frame.getAttribute('data-dialogid');
        if (dialogId) {
            const { customData } = JSON.parse(data);
            const frames = document.querySelectorAll('IFRAME[data-ac-polyfill');

            frames.forEach(item => {
                const { contentWindow } = item as HTMLFrameElement;
                if (contentWindow) {
                    contentWindow.postMessage({ eventType: SupportedEvents.DIALOG_EVENT, target: `${dialogId}_close`, customData }, '*');
                }
            });

            const modalContainer = document.getElementById(`ac-polyfill-dialog-${dialogId}`);
            if (modalContainer) {
                ReactDOM.unmountComponentAtNode(modalContainer);
                document.body.removeChild(modalContainer);
            }
        }
    }

};

export const addDialogButtonEventHandler = (type: 'submit'|'cancel', event: MessageEvent): void => {
    const handlers = dialogButtonEventHandlers.get(type) || [];
    handlers.push(event);
    dialogButtonEventHandlers.set(type, handlers);
};

export const getDialogButtonEventHandlers = (type: 'submit'|'cancel'): Array<MessageEvent> => {
    return dialogButtonEventHandlers.get(type) || [];
};

export const setDialogButtonEvent = (eventHandler: (event: MessageEvent) => void): void => {
    dialogButtonEvent = eventHandler;
};

export const getCustomData = (event: MessageEvent): void => {
    sendDialogResponse(event, (dialogId: string) => {
        return {
            name: 'customData',
            data: dialogCustomData.get(dialogId) || {}
        };
    });
};

export const sendDialogResponse = ({ source, data }: MessageEvent, fetchData?: (dialogId: string) => { name: string, data: unknown }): void => {
    const frame = findSource(source as Window);
    if (frame && frame.contentWindow) {
        const { requestId } = JSON.parse(data);
        if (requestId) {
            const dialogId = frame.getAttribute('data-dialogid');
            if (dialogId) {
                const postData = fetchData ? fetchData(dialogId) : null;
                if (postData) {
                    const { name, data } = postData;
                    frame.contentWindow.postMessage({ requestId, [name]: data }, '*');
                } else {
                    frame.contentWindow.postMessage({ requestId }, '*');
                }
            }
        }
    }
};



