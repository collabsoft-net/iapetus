// The reason these unused vars are here is because they are placeholders
// They are taken from the AP / Connect documentation and can be used once the method is implemented
/* eslint-disable @typescript-eslint/no-unused-vars */

import { findSource } from './iframe';

let macroData: unknown = null;
let saveMacroEventHandler = (_macroParameters: unknown, _macroBody: string) => {};
let closeMacroEditorEventHandler = () => {};

export const setMacroData = (data: unknown): void => {
    macroData = data;
};

export const setSaveMacroEventHandler = (eventHandler: (macroParameters: unknown, macroBody: string) => void): void => {
    saveMacroEventHandler = eventHandler;
};

export const getSaveMacroEventHandler = (): (_macroParameters: unknown, _macroBody: string) => void => {
    return saveMacroEventHandler;
};

export const setCloseMacroEditorEventHandler = (eventHandler: () => void): void => {
    closeMacroEditorEventHandler = eventHandler;
};

export const getCloseMacroEditorEventHandler = (): () => void => {
    return closeMacroEditorEventHandler;
};

export const getMacroData = ({ source, data }: MessageEvent): void => {
    const frame = findSource(source as Window);
    if (frame && frame.contentWindow) {
        const { requestId } = JSON.parse(data);
        if (requestId) {
            const dialogId = frame.getAttribute('data-macroid');
            if (dialogId) {
                frame.contentWindow.postMessage({ requestId, macroData }, '*');
            }
        }
    }
};

