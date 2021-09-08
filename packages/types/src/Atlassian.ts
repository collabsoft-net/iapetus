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
}
