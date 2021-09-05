
import { AsyncContainerModule,Container, ContainerModule } from 'inversify';
import getDecorators from 'inversify-inject-decorators';

import { BindingLifecyclePhases } from './BindingLifecyclePhases';

export class Kernel extends Container implements Kernel {

  private _hooks = new Map<BindingLifecyclePhases, Array<ContainerModule>>();
  private _asyncHooks = new Map<BindingLifecyclePhases, Array<AsyncContainerModule>>();
  private _initialized = false;

  registerHook(lifecyclePhase: BindingLifecyclePhases, registry: ContainerModule): Kernel {
    const hooks = this._hooks.get(lifecyclePhase) || [];
    hooks.push(registry);
    this._hooks.set(lifecyclePhase, hooks);
    return this;
  }

  registerAsyncHook(lifecyclePhase: BindingLifecyclePhases, registry: AsyncContainerModule): Kernel {
    const hooks = this._asyncHooks.get(lifecyclePhase) || [];
    hooks.push(registry);
    this._hooks.set(lifecyclePhase, hooks);
    return this;
  }

  async build(): Promise<void> {
    if (!this._initialized) {
      this._initialized = true;

      const initHooks = this._hooks.get(BindingLifecyclePhases.INIT) || [];
      const initHooksAsync = this._asyncHooks.get(BindingLifecyclePhases.INIT) || [];

      const apiHooks = this._hooks.get(BindingLifecyclePhases.API_LOADED) || [];
      const apiHooksAsync = this._asyncHooks.get(BindingLifecyclePhases.API_LOADED) || [];

      const uiHooks = this._hooks.get(BindingLifecyclePhases.UI_LOADED) || [];
      const uiHooksAsync = this._asyncHooks.get(BindingLifecyclePhases.UI_LOADED) || [];

      this.load(...initHooks);
      await this.loadAsync(...initHooksAsync);

      this.load(...apiHooks);
      await this.loadAsync(...apiHooksAsync);

      this.load(...uiHooks.filter((item) => item instanceof ContainerModule));
      await this.loadAsync(...uiHooksAsync);
    }
  }

}

const instance = new Kernel();
export default instance;
export const { lazyInject } = getDecorators(instance, false);