


export const loginToConfluence = async (username?: string, password?: string): Promise<void> => {
  const isLoggedIn = await browser.exists('#com-atlassian-confluence', false);
  if (!isLoggedIn && username && password) {
    await browser.setValue('#username', username);
    await browser.click('#login-submit', '#password');
    await browser.setValue('#password', password);
    await browser.click('#login-submit', '#com-atlassian-confluence');
  } else {
    return Promise.reject('Could not log in to Confluence, as the instance is not publicly avaiable and no credentials have been provided');
  }
}

export const editPage = async (): Promise<void> => {
  const isEditingPage = await browser.exists('button[aria-label="Insert"]', false);
  if (!isEditingPage) {
    await browser.click('raw:#editPageLink', 'button[aria-label="Insert"]');
  }
}

export const removeAllExistingMacros = async (): Promise<void> => {
  let pageHasMacro = await browser.exists('div[extensiontype="com.atlassian.confluence.macro.core"]', false);
  while(pageHasMacro) {
    await browser.click(`div[extensiontype="com.atlassian.confluence.macro.core"]`);
    await browser.click('.ak-editor-content-area div[aria-label="Extension floating controls"] button[aria-label="Remove"]')
    pageHasMacro = await browser.exists('div[extensiontype="com.atlassian.confluence.macro.core"]', false);
  }
}

export const addMacroToPage = async (name: string, extensionKey: string): Promise<void> => {
  await browser.click('//button[not(@disabled) and @aria-label="Insert"]', 'div[aria-label="Popup"] input[aria-label="search"]');
  await browser.setValue('div[aria-label="Popup"] input[aria-label="search"]', name);
  await browser.click(`span[aria-describedby="${name}"]`);
  await browser.waitForDisplayed(`div[extensionkey="${extensionKey}"]`);
}

export const openMacroEditor = async (extensionKey: string): Promise<void> => {
  await browser.waitForDisplayed(`div[extensionkey="${extensionKey}"]`);
  const isMacroEditorOpen = await browser.isVisible('form[data-testid="extension-config-panel"]');
  if (!isMacroEditorOpen) {
    await browser.click(`div[extensionkey="${extensionKey}"]`);
    await browser.click('.ak-editor-content-area div[aria-label="Extension floating controls"] button[aria-label="Edit"]')
  }
}

export const setMacroField = async (name: string, value: string): Promise<void> => {
  await browser.waitForDisplayed(`form[data-testid="extension-config-panel"] input[name="${name}"]`);
  await browser.clearValue(`form[data-testid="extension-config-panel"] input[name="${name}"]`);
  await browser.setValue(`form[data-testid="extension-config-panel"] input[name="${name}"]`, value);
}

export const waitForMacroToLoad = async (extensionKey: string): Promise<void> => {
  await browser.use(`div[extensionkey="${extensionKey}"] iframe.ap-iframe`);
  await browser.hasAttribute('.ac-content[data-test-state]', 'data-test-state', 'SUCCESS');
  browser.switchToParentFrame();
}

export const closeMacroEditor = async (): Promise<void> => {
  const isMacroEditorOpen = await browser.isVisible('form[data-testid="extension-config-panel"]');
  if (isMacroEditorOpen) {
    await browser.click('form[data-testid="extension-config-panel"] span[role="img"][aria-label="Close"]');
  }
}

export const removeMacro = async (extensionKey: string): Promise<void> => {
  const isMacroAvailable = await browser.isVisible(`div[extensionkey="${extensionKey}"]`, false);
  if (isMacroAvailable) {
    await browser.click(`div[extensionkey="${extensionKey}"]`);
    const isRemoveButtonAvailable = await browser.isVisible('.ak-editor-content-area div[aria-label="Extension floating controls"] button[aria-label="Remove"]', false);
    if (isRemoveButtonAvailable) {
      await browser.click('.ak-editor-content-area div[aria-label="Extension floating controls"] button[aria-label="Remove"]')
    }
  }
}
