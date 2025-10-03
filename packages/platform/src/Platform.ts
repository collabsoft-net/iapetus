/* eslint-disable @typescript-eslint/no-namespace */
// The reason these unused vars are here is because they are placeholders
// They are taken from the Forge / AP / Connect documentation and can be used once the method is implemented

import { Applications, Modes } from "@collabsoft-net/enums";
import { AbstractRestClientService, BitbucketClientService, ConfluenceClientService, JiraClientService } from "@collabsoft-net/services";
import { Props } from "@collabsoft-net/types";
import { NavigationLocation } from "@forge/bridge/out/router/types";
import { DocNode } from '@atlaskit/adf-schema';
import { Subscription } from "@forge/bridge/out/types";

export {};

declare global {

  namespace Platform {

    type CreateBridge = <T extends Applications, X extends AbstractRestClientService> (product: T, service: X) => Promise<Platform.Bridge<T, X>>;

    type ClientService<T extends Applications> = T extends Applications.JIRA
      ? JiraClientService<Modes>
      : T extends Applications.CONFLUENCE
        ? ConfluenceClientService<Modes>
        : BitbucketClientService<Modes>;

    type ContentContext<T extends Applications> = T extends Applications.JIRA
      ? JiraContentContext
      : T extends Applications.CONFLUENCE
        ? ConfluenceContentContext
        : BitbucketContentContext;

    type JiraContentContext = {
      project?: { key?: string; id?: string; type?: string; };
      issue?: { key?: string; id?: string; type?: string; typeId?: string; };
    }

    type ConfluenceContentContext = {
      space?: { key?: string; id?: string; };
      content?: { id?: string; type?: string; subtype?: string; };
      macro?: { outputType: string }
    }

    type BitbucketContentContext = {
      workspace?: { uuid?: string; };
      repository?: { uuid?: string; };
    }

    type HistoryState = {
      hash: string;
      href: string;
      key?: string;
      title?: string;
    }

    // Unfortunately, this is undocumented
    // This is the object that is passed when listening to AP.history.popState()
    // Object data has been extracted from inspection, but is unreliable
    type HistoryPopState = {
      hash: string;
      href: string;
      key?: string;
      newURL: string;
      oldURL?: string
      query: string;
      state: string|unknown;
      title?: string;
    }

    interface DialogContext extends Record<string, unknown> {
      moduleKey: string
    }
    
    type DialogOptions<T extends DialogContext, X> = {
      key: string;
      size?: 'small' | 'medium' | 'large' | 'xlarge' | 'max';
      height?: string;
      width?: string;
      context?: T;
      closeOnEscape?: boolean;
      onClose?: (payload?: X) => void;
    }

    type DialogButton = {
      enable: () => void;
      disable: () => void;
      isEnabled: (callback: (isEnabled: boolean) => void) => void;
      toggle: () => void;
      trigger: () => void;
      isHidden: (callback: (isHidden: boolean) => void) => void;
      hide: () => void;
      show: () => void;
      bind: (callback: () => void) => void;
    }

    type RouterNavigationLocation = NavigationLocation;

    interface Bridge<T extends Applications, X extends AbstractRestClientService> {

      product: T,
      platform: Modes,
      client: ClientService<T>;
      service: X;

      init: {
        createPlaceholder: () => Promise<HTMLDivElement|null>;
      };
    
      events: {
        on: (event: string, callback: (payload?: unknown) => Promise<unknown>) => Promise<Subscription>;
        emit: (event: string, payload: unknown) => Promise<void>;
      }

      theming: {
        enable: () => Promise<void>;
      };
    
      user: {
        getCurrentUser: () => Promise<string|undefined>;
      };

      context: {
        getToken: () => Promise<string|null>;
        content: () => Promise<ContentContext<T>>; 
      };

      dialog: {
        open: <T extends DialogContext, X> (options: DialogOptions<T, X>) => Promise<void>;
        getProperties: () => Promise<Props|undefined>;
        getButton: (name: string) => DialogButton|null;
        close: (payload?: unknown) => void;
      },

      router: {
        open: {
          (url: string): void;
          (location: RouterNavigationLocation): void;
        },
        navigate: {
          (url: string): void;
          (location: RouterNavigationLocation): void;
        };
        reload: () => void;
      };

      history: {
        back: () => void;
        forward: () => void;
        go: (delta: number) => void;
        getState: {
          (): string|HistoryState;
          (type: 'hash'|'all'|undefined): string|HistoryState;
          (type: 'hash'|'all'|undefined, callback: (data: string|HistoryState) => void): string|HistoryState;
        };
        pushState: (newState: string, title?: string, url?: string) => void;
        replaceState: (url: string) => void;
        // Unfortunately, this is undocumented
        popState: (handler: (state: HistoryPopState) => void) => void;
      };
    
      macro: {
        disableCloseOnSubmit: () => void;
        getProperties: () => Promise<Props|undefined>;
        setProperties: <T> (data: T, body?: string|DocNode, keepEditing?: boolean) => Promise<void>;
        close: () => void;
      };
    }

  }
}
