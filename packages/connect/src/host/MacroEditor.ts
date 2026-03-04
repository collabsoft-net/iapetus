import { MacroEditorOptions, WindowWithMacroEditor } from '../client/Types';
import { App, Host } from '../Host';

const windowWithMacroEditor = window as WindowWithMacroEditor;

export class MacroEditor {

  public eventHandlers = new Map<string, () => void>();

  private macroBody = new Map<string, string>();
  private macroData = new Map<string, Record<string, string>>();
  private active: boolean = false;
  private closeOnSubmitDisabled: boolean = false;

  constructor(private AC: Host) {
  }

  public get isOpen() {
    return this.active;
  }

  public async register(app: App) {
    const macroBrowserAvailable = await this.waitForMacroBrowser();
    if (macroBrowserAvailable) {
      if (app.editors) {
        Object.entries(app.editors).forEach(([ key, options ]) => {
          windowWithMacroEditor.AJS.MacroBrowser.setMacroJsOverride(key, {
            opener: (macroData: { name: string, schemaVersion: number, body: string, params: Record<string, string> }) => {
              const body = macroData.body || '';
              const params = macroData.params || {};
              const name = Object.keys(params).length <= 0 ? options.insertTitle : options.editTitle || macroData.name;
              this.macroBody.set(key, body);
              this.macroData.set(key, params);
              this.open(app, key, name || key, params, options);
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
    // We need to make sure AJS.dialog2() is available
    if (!windowWithMacroEditor.AJS.dialog2) {
      throw new Error('AJS.dialog2() is not available. Please make sure to add `com.atlassian.auiplugin:dialog2` as a dependency if you want to be able to use the AP macro editor.')
    }

    const dialog = windowWithMacroEditor.AJS.dialog2(`#ap-macroeditor-${key}`);
    if (dialog) {
      if (isCancelled) {
        windowWithMacroEditor.tinymce.confluence.macrobrowser.macroBrowserCancel();
      }
      dialog.remove();
      this.active = false;
    }
  }

  private open = (app: App, key: string, name: string, params: Record<string, string>, options: MacroEditorOptions) => {

    // We need to make sure AJS.dialog2() is available
    if (!windowWithMacroEditor.AJS.dialog2) {
      throw new Error('AJS.dialog2() is not available. Please make sure to add `com.atlassian.auiplugin:dialog2` as a dependency if you want to be able to use the AP macro editor.')
    }

    const isEditing = Object.keys(params).length > 0;
    const style = `width:${options.width || '50%'};height:${options.height || '50%'};z-index: 3000`;

    // This is a weird quirk
    // If width and height are set to 100%, we open the modal without header / footer
    const chromeless = options.width === '100%' && options.height === '100%';

    const urlPrefix = app.servletPath.endsWith('/') ? app.servletPath.slice(0, -1) : app.servletPath;
    let url = options.url.startsWith('/') ? `${urlPrefix}${options.url}` : options.url;

    const defaultQueryString = `xdm_e=${this.AC.options.xdm_e}&cp=${this.AC.options.contextPath}&lic=${app.license}&xdm_c=DO_NOT_USE&cv=DO_NOT_USE`;
    url += url.includes('?') ? `&${defaultQueryString}` : `?${defaultQueryString}`;

    const template = `
      <section id="ap-macroeditor-${key}" role="dialog" class="aui-layer aui-dialog2 ap-aui-dialog2 " aria-hidden="false" tabindex="-1" aria-labelledby="static-dialog--heading" style="${style}">
        ${ !chromeless ? `
          <header class="aui-dialog2-header">
            <h2 class="aui-dialog2-header-main" id="static-dialog--heading">${name}</h2>
          </header>
        ` : ``}
        <div class="aui-dialog2-content">
          <iframe id="ap-macroeditor-${key}-frame" data-ap-appkey="${app.appKey}" src="${url}" style="width:100%;height:100%;border:none;" name="${key}"></iframe>
        </div>
        ${ !chromeless ? `
          <footer class="aui-dialog2-footer">
            <div class="aui-dialog2-footer-actions">
              <button id="ap-macroeditor-${key}-submit-button" class="aui-button aui-button-primary">${ isEditing ? 'Submit' : 'Insert' }</button>
              <button id="ap-macroeditor-${key}-cancel-button" class="aui-button aui-button-link">Cancel</button>
            </div>
          </footer>
        ` : ``}
        )}
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
