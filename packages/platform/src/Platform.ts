/* eslint-disable @typescript-eslint/no-namespace */
// The reason these unused vars are here is because they are placeholders
// They are taken from the Forge / AP / Connect documentation and can be used once the method is implemented

import { Applications, Modes } from "@collabsoft-net/enums";
import { BitbucketClientService, ConfluenceClientService, JiraClientService } from "@collabsoft-net/services";
import { Props } from "@collabsoft-net/types";
import { NavigationLocation } from "@forge/bridge/out/router/types";
import { DocNode } from '@atlaskit/adf-schema';

export {};

declare global {

  namespace Platform {

    type CreateBridge = <T extends Applications> (product: T) => Promise<Platform.Bridge<T>>;

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

    type RouterNavigationLocation = NavigationLocation;

    interface Bridge<T extends Applications> {

      product: T,
      platform: Modes,

      init: {
        createPlaceholder: () => Promise<HTMLDivElement|null>;
      };
    
      theming: {
        enable: () => Promise<void>;
      };
    
      user: {
        getCurrentUser: () => Promise<string|undefined>;
      };

      context: {
        content: () => Promise<ContentContext<T>>; 
      };

      dialog: {
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

      client: ClientService<T>;
    
      macro: {
        getProperties: () => Promise<Props|undefined>;
        setProperties: <T> (data: T, body?: string|DocNode, keepEditing?: boolean) => Promise<void>;
        close: () => void;
      };

    }

  }
}
