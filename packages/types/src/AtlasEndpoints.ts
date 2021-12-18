
export interface AtlasEndpoints extends Record<string, string> {
  CURRENTUSER: string;
  USER: string;
  MYPERMISSIONS: string;

  READ_PROJECT: string;
  LIST_PROJECTS: string;

  READ_ISSUE: string;

  READ_VERSION: string;
  LIST_VERSIONS: string;
  LIST_VERSIONS_PAGINATED: string;
  VERSION_CREATE: string;
  VERSION_UPDATE: string;
  VERSION_DELETE: string;
  VERSION_ISSUE_COUNTS: string;
  ALL_RELEASES: string;
  RELEASE_DETAILS: string;
  LIST_COMPONENTS: string;
  LIST_COMPONENTS_PAGINATED: string;
  READ_COMPONENT: string;
  COMPONENT_CREATE: string;
  COMPONENT_UPDATE: string;
  COMPONENT_DELETE: string;
  BOARDS: string;
  BOARD_FEATURES: string;
  USER_PROPERTY_BY_KEY: string;
  PERMISSIONS_CHECK: string;

  CONTENT_PERMISSIONS: string;
  SPACE: string;
  MEMBEROF: string;

  APP: string;
}