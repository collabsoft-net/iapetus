
export enum JiraCloudEndpoints {
  APP = '/rest/atlassian-connect/1/addons/:appKey',
  USER = '/rest/api/3/user',
  CURRENTUSER = '/rest/api/3/myself',
  USERS_FOR_PICKER = '/rest/api/3/user/picker',

  MYPERMISSIONS = '/rest/api/3/mypermissions',
  PERMISSIONS = '/rest/api/3/permissions',
  PERMISSIONS_CHECK = '/rest/api/3/permissions/check',

  USER_PROPERTY_BY_KEY = '/rest/api/3/user/properties/:propertyKey',
  PROJECT_PROPERTY_BY_KEY = '/rest/api/3/project/:projectIdOrKey/properties/:propertyKey',
  ISSUE_PROPERTY_BY_KEY = '/rest/api/3/issue/:issueIdOrKey/properties/:propertyKey',
  COMMENT_PROPERTY_BY_KEY = '/rest/api/3/comment/:commentId/properties/:propertyKey',

  READ_PROJECT = '/rest/api/3/project/:projectIdOrKey',
  LIST_PROJECTS = '/rest/api/3/project',

  LIST_PROJECT_ROLES = '/rest/api/2/project/:projectIdOrKey/role',
  READ_PROJECT_ROLE = '/rest/api/2/project/:projectIdOrKey/role/:id',

  LIST_PROJECT_FEATURES = '/rest/api/3/project/:projectIdOrKey/features',
  UPDATE_PROJECT_FEATURE = '/rest/api/3/project/:projectIdOrKey/features/:featureKey',

  STATUSES = '/rest/api/3/project/:projectIdOrKey/statuses',
  STATUSDETAILS = '/rest/api/3/status/:idOrName',

  READ_ISSUE = '/rest/api/3/issue/:issueIdOrKey',
  ISSUE_CREATE = '/rest/api/3/issue',
  ISSUE_UPDATE = '/rest/api/3/issue/:issueIdOrKey',
  ISSUE_DELETE = '/rest/api/3/issue/:issueIdOrKey',
  ISSUE_SEARCH = '/rest/api/3/search',

  LIST_FIELDS= '/rest/api/3/field',
  SEARCH_FIELDS = '/rest/api/3/field/search',
  ISSUE_FIELD_OPTIONS = '/rest/api/3/field/:fieldKey/option',
  ISSUE_FIELD_OPTION = '/rest/api/3/field/:fieldKey/option/:optionId',

  READ_COMMENT = '/rest/api/3/issue/:issueIdOrKey/comment/:commentId',
  LIST_COMMENTS = '/rest/api/3/issue/:issueIdOrKey/comment',
  COMMENT_CREATE = '/rest/api/3/issue/:issueIdOrKey/comment',
  COMMENT_UPDATE = '/rest/api/3/issue/:issueIdOrKey/comment/:commentId',

  READ_ATTACHMENT = '/rest/api/3/attachment/:attachmentId',
  ADD_ATTACHMENT = '/rest/api/3/issue/:issueIdOrKey/attachments',

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
  COMPONENT_ISSUE_COUNTS = '/rest/api/3/component/:id/relatedIssueCounts',

  ALL_RELEASES = '/rest/api/3/project/:projectKey/versions',
  RELEASE_DETAILS = '/rest/api/3/version/:versionId',

  BOARDS = '/rest/agile/1.0/board',
  BOARD_FEATURES = '/rest/agile/1.0/board/:boardId/features',

  LIST_DYNAMIC_MODULES = '/rest/atlassian-connect/1/app/module/dynamic',
  REGISTER_DYNAMIC_MODULE = '/rest/atlassian-connect/1/app/module/dynamic',
  UNREGISTER_DYNAMIC_MODULE = '/rest/atlassian-connect/1/app/module/dynamic',
}

export enum JSMCloudEndpoints {
  LIST_DYNAMIC_MODULES = '/rest/atlassian-connect/1/app/module/dynamic',
  REGISTER_DYNAMIC_MODULE = '/rest/atlassian-connect/1/app/module/dynamic',
  UNREGISTER_DYNAMIC_MODULE = '/rest/atlassian-connect/1/app/module/dynamic',
}


export enum ConfluenceCloudEndpoints {
  APP = '/rest/atlassian-connect/1/addons/:appKey',
  USER = '/rest/api/user',
  CURRENTUSER = '/rest/api/user/current',
  MEMBEROF = '/rest/api/user/memberof',

  CONTENT_PERMISSIONS = '/rest/api/content/:id/permission/check',

  SPACE = '/rest/api/space/:spaceKey',

  LIST_DYNAMIC_MODULES = '/rest/atlassian-connect/1/app/module/dynamic',
  REGISTER_DYNAMIC_MODULE = '/rest/atlassian-connect/1/app/module/dynamic',
  UNREGISTER_DYNAMIC_MODULE = '/rest/atlassian-connect/1/app/module/dynamic',
}