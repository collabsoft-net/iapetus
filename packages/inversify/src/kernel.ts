
import { AsyncContainerModule,Container, ContainerModule } from 'inversify';
import getDecorators from 'inversify-inject-decorators';

import { BindingLifecyclePhases } from './BindingLifecyclePhases';

export class Kernel extends Container implements Kernel {

  private hooks = new Map<BindingLifecyclePhases, Array<ContainerModule>>();
  private asyncHooks = new Map<BindingLifecyclePhases, Array<AsyncContainerModule>>();
  private initialized = false;
  private listeners: Array<() => void> = [];

  registerHook(lifecyclePhase: BindingLifecyclePhases, registry: ContainerModule): Kernel {
    const hooks = this.hooks.get(lifecyclePhase) || [];
    hooks.push(registry);
    this.hooks.set(lifecyclePhase, hooks);
    return this;
  }

  registerAsyncHook(lifecyclePhase: BindingLifecyclePhases, registry: AsyncContainerModule): Kernel {
    const hooks = this.asyncHooks.get(lifecyclePhase) || [];
    hooks.push(registry);
    this.hooks.set(lifecyclePhase, hooks);
    return this;
  }

  async build(): Promise<void> {
    if (!this.initialized) {
      this.initialized = true;

      const initHooks = this.hooks.get(BindingLifecyclePhases.INIT) || [];
      const initHooksAsync = this.asyncHooks.get(BindingLifecyclePhases.INIT) || [];

      const apiHooks = this.hooks.get(BindingLifecyclePhases.API_LOADED) || [];
      const apiHooksAsync = this.asyncHooks.get(BindingLifecyclePhases.API_LOADED) || [];

      const uiHooks = this.hooks.get(BindingLifecyclePhases.UI_LOADED) || [];
      const uiHooksAsync = this.asyncHooks.get(BindingLifecyclePhases.UI_LOADED) || [];

      this.load(...initHooks);
      await this.loadAsync(...initHooksAsync);

      this.load(...apiHooks);
      await this.loadAsync(...apiHooksAsync);

      this.load(...uiHooks.filter((item) => item instanceof ContainerModule));
      await this.loadAsync(...uiHooksAsync);

      this.listeners.forEach(listener => listener());
    }
  }

  onReady(listener: () => void): void {
    this.listeners.push(listener);
    if (this.initialized) listener();
  }
}

const instance = new Kernel();
export default instance;
export const { lazyInject } = getDecorators(instance, false);