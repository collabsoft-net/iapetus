export interface Atlassian {
  HOSTNAME: 'confluence'|'jira';
  PRODUCTNAME: 'Confluence'|'Jira';
  getUrl: (path: string) => string;
}