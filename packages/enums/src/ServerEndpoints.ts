
export enum ServerEndpoints {
  CURRENTUSER = '/rest/api/2/myself',
  USER = '/rest/api/2/user',
  USER_PROPERTY_BY_KEY = '/rest/api/2/user/properties/:propertyKey',
  MYPERMISSIONS = '/rest/api/2/mypermissions',
  PERMISSIONS = '/rest/api/2/permissions',
  PERMISSIONS_CHECK = '/rest/user/permission/search',

  READ_PROJECT = '/rest/api/2/project/:projectIdOrKey',
  LIST_PROJECTS = '/rest/api/2/project',

  READ_ISSUE = '/rest/api/2/issue/:issueIdOrKey',

  READ_VERSION = '/rest/api/2/version/:id',
  LIST_VERSIONS = '/rest/api/2/project/:projectIdOrKey/versions',
  LIST_VERSIONS_PAGINATED = '/rest/api/2/project/:projectIdOrKey/version',
  VERSION_CREATE = '/rest/api/2/version',
  VERSION_UPDATE = '/rest/api/2/version/:id',
  VERSION_DELETE = '/rest/api/2/version/:id/removeAndSwap',
  VERSION_ISSUE_COUNTS = '/rest/api/2/version/:id/relatedIssueCounts',

  READ_COMPONENT = '/rest/api/2/component/:id',
  LIST_COMPONENTS = '/rest/api/2/project/:projectIdOrKey/components',
  LIST_COMPONENTS_PAGINATED = '/rest/api/2/project/:projectIdOrKey/component',
  COMPONENT_CREATE = '/rest/api/2/component',
  COMPONENT_UPDATE = '/rest/api/2/component/:id',
  COMPONENT_DELETE = '/rest/api/2/component/:id',

  ALL_RELEASES = '/rest/projects/1.0/project/:projectKey/release/allversions',
  RELEASE_DETAILS = '/rest/projects/1.0/project/:projectKey/release/details/:versionId',

  BOARDS = 'rest/agile/1.0/board',
  BOARD_FEATURES = 'rest/agile/1.0/board/:boardId/features',

  CONTENT_PERMISSIONS = '/rest/api/content',
  SPACE = '/rest/api/space',
  MEMBEROF = '/rest/api/user/memberof',
  APP = '/rest/plugins/1.0/:appKey-key'
}