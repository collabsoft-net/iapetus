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

  const result = await browser.executeAsync((...args) => {
    const [ url, options, done ] = args;
    window.fetch(url, options)
      .then((response) => (response.status !== 204) ? response.json() : Promise.resolve({}))
      .then((result) => done(result))
      .catch((error) => done('[ERROR] ' + error.message));
  }, url, options);
  expect(result).to.not.be.an('string');
  return result;
}

export async function use(selector?: string|Array<string>): Promise<void> {
  if (!selector) {
    browser.switchToParentFrame();
  } else {
    await waitUntil(async () => exists(selector), 60000, undefined, 200);
    browser.switchToFrame(await browser.$(toSelector(selector)));
  }
}

export async function waitUntil(condition: () => boolean|Promise<boolean>, timeout?: number, timeoutMsg?: string, interval?: number): Promise<true | void> {
  return browser.waitUntil(condition, { timeout, interval, timeoutMsg });
}

export async function waitForDisplayed(selector: string|Array<string>, timeout = 10000): Promise<true | void> {
  const CSSSelector = toSelector(selector);
  const elm = await browser.$(CSSSelector);
  if (!elm) throw new Error(`Could not find element by ${CSSSelector}`);
  return elm.waitForDisplayed({ timeout });
}

export async function exists(selector: string|Array<string>, assert = true): Promise<boolean> {
  const exists = await exec(toSelector(selector), 'isExisting');
  if (assert) { expect(exists, `Expected ${selector} to exists, but it does not`).to.be.true; }
  return exists;
}

export async function isVisible(selector: string|Array<string>, assert = true): Promise<boolean> {
  const visible = await exec(toSelector(selector), 'isDisplayed');
  if (assert) expect(visible, `Expected '${selector}' to be visible, but it is not`).to.be.true;
  return visible;
}

export async function isEnabled(selector: string|Array<string>, assert = true): Promise<boolean> {
  const enabled = await exec(toSelector(selector), 'isEnabled');
  if (assert) expect(enabled, `Expected ${selector} to be enabled, but it is not`).to.be.true;
  return enabled;
}

export async function getText(selector: string|Array<string>): Promise<string> {
  return await exec(toSelector(selector), 'getText');
}

export async function getValue(selector: string|Array<string>): Promise<string> {
  return await exec(toSelector(selector), 'getValue');
}

export async function hasText(selector: string|Array<string>, value: string, assert = true): Promise<boolean> {
  const text = await getText(toSelector(selector));
  if (assert) text.should.be.equal(value);
  return text === value;
}

export async function setValue(selector: string|Array<string>, value: string): Promise<void> {
  await exec(toSelector(selector), 'setValue', value);
  await browser.pause(200);
}

export async function hasValue(selector: string|Array<string>, value: string, assert = true): Promise<boolean> {
  const text = await getValue(toSelector(selector));
  if (assert) text.should.be.equal(value, `Expected ${selector} text to be ${value}, but it is not`);
  return text === value;
}

export async function clearValue(selector: string|Array<string>): Promise<void> {
  await exec(toSelector(selector), 'clearValue');
  browser.execute((selector) => {
    const input: HTMLInputElement|null = document.querySelector(selector);
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input'));
    }
  }, toSelector(selector));
}

export async function hasAttribute(selector: string|Array<string>, name: string, value?: string|RegExp): Promise<void> {
  await waitForDisplayed(selector);
  const attr: string = await exec(toSelector(selector), 'getAttribute', name);
  expect(attr, `Expected ${attr} to exist on ${selector}, but it does not`).to.exist;
  if (value) {
    if (value instanceof RegExp) {
      value.test(attr).should.be.true;
    } else if (typeof value === 'string') {
      attr.should.be.equal(value);
    } else {
      return Promise.reject('Unrecognized value format, only string & RegExp are supported');
    }
  }
}

export async function click(selector: string|Array<string>, waitForElement?: string|Array<string>, timeout?: number): Promise<void> {
  await waitForDisplayed(selector);
  const elm = await browser.$(toSelector(selector));
  elm.scrollIntoView();
  elm.click();
  if (waitForElement) await waitForDisplayed(waitForElement, timeout);
}

export async function hasChildren(selector: string|Array<string>, expected?: number): Promise<void> {
  const elements = await browser.$$(toSelector(selector));
  expect(elements).to.exist;
  if (expected) {
    elements.length.should.equal(expected);
  } else {
    elements.length.should.be.at.least(1);
  }
}

export function toSelector(selector: string|Array<string>): string {
  const names = Array.isArray(selector) ? selector : [ selector ];
  if (names.length === 1) {
    if (names[0].startsWith('[data-wd-id')) {
      return names[0];
    } else if (names[0].startsWith('raw:')) {
      return names[0].replace('raw:', '');
    } else {
      const selector: string = names[0];
      const items = selector.split(' ');
      return items.map((item) => item.startsWith('#') ? `[data-wd-id="${item.substr(1)}"]` : item).join(' ');
    }
  }
  return names.map((name) => `[data-wd-id="${name}"]`).join(' ');
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
  // await waitForDisplayed(`raw:${selector}`);
  const elm = await browser.$(selector);
  // eslint-disable-next-line
  return (elm as any)[method](...args);
};
