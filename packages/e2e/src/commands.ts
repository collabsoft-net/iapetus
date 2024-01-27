import { expect, should, use as chaiUse } from 'chai';
import chaiString from 'chai-string';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
chaiUse(chaiString);
should();

export async function open(url: string, waitForElement?: string|Array<string>, timeout?: number): Promise<void> {
  browser.url(url);
  if (waitForElement) await waitForDisplayed(waitForElement, timeout);
}

export async function fetch(url: string, options: RequestInit = {}): Promise<unknown> {
  browser.switchToParentFrame();

  // eslint-disable-next-line
  const result = await browser.executeAsync((...args: [any, any, any]) => {
    const [ url, options, done ] = args;
    window.fetch(url, options)
      .then((response) => (response.status !== 204) ? response.json() : Promise.resolve({}))
      .then((result) => done(result))
      .catch((error) => done('[ERROR] ' + error.message));
  }, url, options);
  expect(result).to.not.be.an('string');
  return result;
}

export async function findElement(selector: string|Array<string>) {
  const items = Array.isArray(selector) ? selector : [ selector ];
  for await (const item of items) {
    const isValidSelector = await exists(item, false);
    if (isValidSelector) {
      return browser.$(item);
    }
  }
}

export async function use(selector?: string|Array<string>): Promise<void> {
  if (!selector) {
    browser.switchToParentFrame();
  } else {
    await waitUntil(async () => exists(selector), 60000, undefined, 200);
    const iframe = await findElement(selector);
    if (iframe) {
      browser.switchToFrame(iframe);
    }
  }
}

export async function waitUntil(condition: () => boolean|Promise<boolean>, timeout?: number, timeoutMsg?: string, interval?: number): Promise<true | void> {
  return browser.waitUntil(condition, { timeout, interval, timeoutMsg });
}

export async function waitForDisplayed(selector: string|Array<string>, timeout = 10000): Promise<boolean> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  await Promise.all(items.map(item => browser.$(item).then((elm: WebdriverIO.Element) => elm.waitForDisplayed({ timeout })).catch(() => {})));
  return exists(selector);
}

export async function exists(selector: string|Array<string>, assert = true): Promise<boolean> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  let exists = false;

  for await(const item of items) {
    const isExisting = await exec(item, 'isExisting');
    if (isExisting) exists = true;
  }

  if (assert) { expect(exists, `Expected ${selector} to exists, but it does not`).to.be.true; }
  return exists;
}

export async function isVisible(selector: string|Array<string>, assert = true): Promise<boolean> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  let visible = false;

  for await(const item of items) {
    const isDisplayed = await exec(item, 'isDisplayed');
    if (isDisplayed) visible = true;
  }

  if (assert) expect(visible, `Expected '${selector}' to be visible, but it is not`).to.be.true;
  return visible;
}

export async function isEnabled(selector: string|Array<string>, assert = true): Promise<boolean> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  let enabled = false;

  for await(const item of items) {
    const isEnabled = await exec(item, 'isEnabled');
    if (isEnabled) enabled = true;
  }

  if (assert) expect(enabled, `Expected ${selector} to be enabled, but it is not`).to.be.true;
  return enabled;
}

export async function hasText(selector: string|Array<string>, value: string, assert = true): Promise<boolean> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  let hasText = false;

  for await(const item of items) {
    const text = await getText(item);
    if (text === value) hasText = true;
  }

  if (assert) expect(hasText, `Expected ${selector} text to equal value ${value}, but it does not`).to.be.true;
  return hasText;
}

export async function hasValue(selector: string|Array<string>, value: string, assert = true): Promise<boolean> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  let hasValue = false;

  for await(const item of items) {
    const currentValue = await getValue(item);
    if (currentValue === value) hasValue = true;
  }

  if (assert) expect(hasValue, `Expected ${selector} to equal value ${value}, but it does not`).to.be.true;
  return hasValue;
}

export async function hasAttribute(selector: string|Array<string>, name: string, value?: string|RegExp): Promise<boolean> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  let hasAttribute = false;

  await waitForDisplayed(selector);
  for await (const item of items) {
    const attr: string = await exec(item, 'getAttribute', name);
    if (value) {
      if (value instanceof RegExp) {
        if (value.test(attr)) hasAttribute = true;
      } else if (typeof value === 'string') {
        if (attr === value) hasAttribute = true;
      } else {
        return Promise.reject('Unrecognized value format, only string & RegExp are supported');
      }
    }
  }

  expect(hasAttribute, `Expected attribute ${name} to exist on ${selector}, but it does not`).to.be.true;
  return hasAttribute;
}

export async function hasChildren(selector: string|Array<string>, expected?: number): Promise<boolean> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  let hasChildren = false;

  for await (const item of items) {
    const elements = await browser.$$(item);
    if (elements) {
      if (expected && elements.length === expected) {
        hasChildren = true;
      } else if (elements.length > 0) {
        hasChildren = true;
      }
    }
  }

  expect(hasChildren, expected ? `Expected ${selector} to have ${expected} children, but it does not` : `Expected ${selector} to have at least one child, but it does not`).to.be.true;
  return hasChildren;
}

export async function getText(selector: string|Array<string>): Promise<string|Array<string>|undefined> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  const result: Array<string> = [];
  for await (const item of items) {
    const value = await exec(item, 'getText');
    if (value) result.push(value);
  }
  return result.length > 1 ? result : result.pop();
}

export async function getValue(selector: string|Array<string>): Promise<string|Array<string>|undefined> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  const result: Array<string> = [];
  for await (const item of items) {
    const value = await exec(item, 'getValue');
    if (value) result.push(value);
  }
  return result.length > 1 ? result : result.pop();
}

export async function setValue(selector: string|Array<string>, value: string): Promise<void> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  for await (const item of items) {
    await exec(item, 'setValue', value);
    await browser.pause(200);
  }
}

export async function clearValue(selector: string|Array<string>): Promise<void> {
  const items = Array.isArray(selector) ? selector : [ selector ];
  for await (const item of items) {
    await exec(item, 'clearValue');
    browser.execute((selector: string) => {
      const input: HTMLInputElement|null = document.querySelector(selector);
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input'));
      }
    }, item);
  }
}

export async function click(selector: string, waitForElement?: string|Array<string>, timeout?: number): Promise<void> {
  await waitForDisplayed(selector);
  const elm = await browser.$(selector);
  elm.scrollIntoView();
  elm.click();
  if (waitForElement) await waitForDisplayed(waitForElement, timeout);
}

export function captureScreenshot(name: string): void {
  const ts = new Date().getTime();
  // get current test title and clean it, to use it as file name
  const filename = encodeURIComponent(name.replace(/\s+/g, '-').replace(/\./g,'_'));
  // build file path
  const filePath = `./test/screenshots/${ts}-${filename}.png`;
  // Make sure the parent directory is available
  mkdirSync(dirname(filePath), { recursive: true });
  // save screenshot
  browser.saveScreenshot(filePath);
  console.log('\n\tScreenshot location:', filePath, '\n');
}

const exec = async (selector: string, method: string, ...args: Array<unknown>) => {
  const elm = await browser.$(selector);
  // eslint-disable-next-line
  return (elm as any)[method](...args);
};
