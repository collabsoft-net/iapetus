
export enum CloudEndpoints {
  CURRENTUSER = '/rest/api/3/myself',
  USER = '/rest/api/3/user',
  USER_PROPERTY_BY_KEY = '/rest/api/3/user/properties/:propertyKey',
  MYPERMISSIONS = '/rest/api/3/mypermissions',
  PERMISSIONS = '/rest/api/3/permissions',
  PERMISSIONS_CHECK = '/rest/api/3/permissions/check',

  READ_ISSUE = '/rest/api/3/issue/:issueIdOrKey',

  READ_PROJECT = '/rest/api/3/project/:projectIdOrKey',
  LIST_PROJECTS = '/rest/api/3/project',

  READ_VERSION = '/rest/api/3/version/:id',
  LIST_VERSIONS = '/rest/api/3/project/:projectIdOrKey/versions',
  LIST_VERSIONS_PAGINATED = '/rest/api/3/project/:projectIdOrKey/version',
  VERSION_CREATE = '/rest/api/3/version',
  VERSION_UPDATE = '/rest/api/3/version/:id',
  VERSION_DELETE = '/rest/api/3/version/:id/removeAndSwap',
  VERSION_ISSUE_COUNTS = '/rest/api/3/version/:id/relatedIssueCounts',

  READ_COMPONENT = '/rest/api/3/component/:id',
  LIST_COMPONENTS = '/rest/api/3/project/:projectIdOrKey/components',
  LIST_COMPONENTS_PAGINATED = '/rest/api/3/project/:projectIdOrKey/component',
  COMPONENT_CREATE = '/rest/api/3/component',
  COMPONENT_DELETE = '/rest/api/3/component/:id',
  COMPONENT_UPDATE = '/rest/api/3/component/:id',

  ALL_RELEASES = '/rest/api/3/project/:projectKey/versions',
  RELEASE_DETAILS = '/rest/api/3/version/:versionId',

  BOARDS = '/rest/agile/1.0/board',
  BOARD_FEATURES = '/rest/agile/1.0/board/:boardId/features',

  CONTENT_PERMISSIONS = '/rest/api/content/:id/permission/check',
  SPACE = '/rest/api/space/:spaceKey',
  MEMBEROF = '/rest/api/user/memberof',
  APP = '/rest/atlassian-connect/1/addons/:addonKey'
}