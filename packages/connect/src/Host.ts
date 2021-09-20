
import { ConfluenceHelper, JiraHelper } from '@collabsoft-net/types';

import { processDialogEvent } from './Dialog';
import { findSource } from './iframe';
import { getCloseMacroEditorEventHandler, getMacroData, getSaveMacroEventHandler } from './Macro';
import { getNavigatorLocation, go } from './Navigator';
import { resize } from './Resize';
import { SupportedEvents } from './SupportedEvents';

export const Host = async (modules: Record<string, string>, dialogs: Record<string, string>, helper: ConfluenceHelper|JiraHelper): Promise<void> => {
    try {
        console.log('[AC] Initializing Atlassian Connect polyfill');
        window.addEventListener('message', (event) => {
            const { data } = event;
            console.log('[AC] Received event', event, data);
            if (data && typeof data === 'string') {
                const frame = findSource(event.source as Window);
                const { eventType, name, requestId } = JSON.parse(data);
                if (eventType) {
                    switch (eventType) {
                        case SupportedEvents.HANDSHAKE:
                            console.log('[AC] Received handshake, estalishing connection', event);
                            if (frame && frame.contentWindow) {
                                if (requestId) {
                                    frame.contentWindow.postMessage({requestId}, '*');
                                }
                            }
                            break;

                        case SupportedEvents.RESIZE:
                            resize(event);
                            break;

                        case SupportedEvents.DIALOG_CREATE:
                        case SupportedEvents.DIALOG_EVENT:
                            processDialogEvent(event, dialogs, helper);
                            break;

                        case SupportedEvents.MACRO_EVENT:
                            if (name === 'getMacroData') {
                                getMacroData(event);
                            } else if (name === 'saveMacro') {
                                const { macroParameters, macroBody } = JSON.parse(data);
                                getSaveMacroEventHandler()(macroParameters, macroBody);
                            } else if (name === 'closeMacroEditor') {
                                getCloseMacroEditorEventHandler()();
                            } else if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() !== 'production') {
                                console.log('[AC] Received unsupport event', event);
                            }
                            break;

                        case SupportedEvents.NAVIGATOR_EVENT:
                            if (name === 'getLocation') {
                                getNavigatorLocation(event);
                            } else if (name === 'go') {
                                go(event, modules, helper);
                            } else if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() !== 'production') {
                                console.log('[AC] Received unsupport event', event);
                            }
                            break;

                            default:
                            if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() !== 'production') {
                                console.log('[AC] Received unsupport event type', eventType);
                            }
                            break;
                    }
                }
            } else {
                console.log('[AC] Received unsupport event payload', data);
            }
        });
    } catch (error) {
        console.log('[AC] An unexpected error occurred', error);
    }
};