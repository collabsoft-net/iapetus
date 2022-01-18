
export interface JiraHelper {
  getUrl: (path: string) => string;
  getProjectId: () => number;
  getProjectKey: () => string|undefined;
  getServletPattern: () => string;
}

export interface ConfluenceHelper {
  getUrl: (path: string) => string;
  getServletPattern: () => string;
}

export interface BitbucketHelper {
  getUrl: (path: string) => string;
  getProjectId: () => number;
  getProjectKey: () => string|undefined;
  getServletPattern: () => string;
}