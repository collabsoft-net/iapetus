
import { Container, ContainerModule } from 'inversify';

import { BindingLifecyclePhases } from './BindingLifecyclePhases';

export interface Kernel extends Container {
  register(lifecyclePhase: BindingLifecyclePhases, registry: ContainerModule): Kernel;
  build(): Promise<void>;
  onReady(listener: () => void): void;
}

class KernelImpl extends Container implements Kernel {

  private hooks = new Map<BindingLifecyclePhases, Array<ContainerModule>>();
  private initialized = false;
  private listeners: Array<() => void> = [];

  register(lifecyclePhase: BindingLifecyclePhases, registry: ContainerModule): Kernel {
    const hooks = this.hooks.get(lifecyclePhase) || [];
    hooks.push(registry);
    this.hooks.set(lifecyclePhase, hooks);
    return this;
  }

  async build(): Promise<void> {
    if (!this.initialized) {
      this.initialized = true;

      const initHooks = this.hooks.get(BindingLifecyclePhases.INIT) || [];
      const apiHooks = this.hooks.get(BindingLifecyclePhases.API_LOADED) || [];
      const uiHooks = this.hooks.get(BindingLifecyclePhases.UI_LOADED) || [];

      await this.load(...initHooks);
      await this.load(...apiHooks);
      await this.load(...uiHooks);

      this.listeners.forEach(listener => listener());
    }
  }

  onReady(listener: () => void): void {
    this.listeners.push(listener);
    if (this.initialized) listener();
  }
}

const instance = new KernelImpl();
export default instance;
