
export interface JiraHelper {
  getUrl: (path: string) => string;
  getProjectId: () => number;
  getProjectKey: () => string|undefined;
}

export interface ConfluenceHelper {
  getUrl: (path: string) => string;
}