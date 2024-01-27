
import { WaitUntilOptions } from 'webdriverio';

export {};

declare global {

  const browser: WebdriverIO.Browser & ExtendedBrowser;

  interface ExtendedBrowser {
    open(url: string): Promise<void>;
    open(url: string, waitForElement?: string|Array<string>): Promise<void>;
    open(url: string, waitForElement?: string|Array<string>, timeout?: number): Promise<void>;
    fetch(url: string, options?: unknown): Promise<unknown>;
    use(selector?: string|Array<string>): Promise<void>;
    waitUntilAsync(condition: () => boolean|Promise<boolean>, options: Partial<WaitUntilOptions>): Promise<true | void>;
    waitForDisplayed(selector: string|Array<string>, timeout?: number): Promise<void>;
    exists(selector: string|Array<string>, assert?: boolean): Promise<boolean>;
    isVisible(selector: string|Array<string>, assert?: boolean): Promise<boolean>;
    isEnabled(selector: string|Array<string>, assert?: boolean): Promise<boolean>;
    getText(selector: string|Array<string>): Promise<string>;
    hasText(selector: string|Array<string>, value: string, assert?: boolean): Promise<boolean>;
    setValue(selector: string|Array<string>, value: string): Promise<void>;
    hasValue(selector: string|Array<string>, value: string, assert?: boolean): Promise<boolean>;
    clearValue(selector: string|Array<string>): Promise<void>;
    hasAttribute(selector: string|Array<string>, name: string, value?: string|RegExp): Promise<void>;
    click(selector: string|Array<string>): Promise<void>;
    click(selector: string|Array<string>, waitForElement?: string|Array<string>): Promise<void>;
    click(selector: string|Array<string>, waitForElement?: string|Array<string>, timeout?: number): Promise<void>;
    hasChildren(selector: string|Array<string>, expected?: number): Promise<void>;
    captureScreenshot(name: string): void;
  }
}