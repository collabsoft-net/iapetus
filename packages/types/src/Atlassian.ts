/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */

export interface Atlassian {
  HOSTNAME: 'confluence'|'jira';
  PRODUCTNAME: 'Confluence'|'Jira';
  getUrl: (path: string) => string;
}

declare global {

  namespace Atlassian {

    interface JWT {
      sub: string;
      qsh: string;
      iss: string;
      context: Record<string, unknown>;
      exp: number;
      iat: number;
    }

  }

  namespace Confluence {

    interface User extends Record<string, unknown> {}

    interface GroupArray {
      results: Array<Group>;
      start: number;
      limit: number;
      size: number;
    }

    interface Group {
      id: string;
      type: 'group';
      name: string;
    }

  }

  namespace Jira {

    interface User extends Record<string, unknown> {}

    interface Issue extends Record<string, unknown> {
      id: string;
      key: string;
      fields: Fields;
    }

    interface Fields extends Record<string, unknown> {
      summary: string;
      project: Project;
    }

    interface Project {
      id: string;
      key: string;
      name: string;
      projectTypeKey: 'service_desk' | 'software';
      simplified: boolean;
    }

    interface Permission {
      id: string;
      key: string;
      name: string;
      type: string;
      description: string;
      havePermission: boolean;
    }

    interface Permissions {
      permissions: Record<string, Permission>;
    }

  }

  namespace UPM {

    interface App {
      version: string;
    }

  }

}
