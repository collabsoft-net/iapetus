/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */

export interface Atlassian {
  HOSTNAME: 'confluence'|'jira'|'bitbucket';
  PRODUCTNAME: 'Confluence'|'Jira'|'Bitbucket';
  getUrl: (path: string) => string;
}

declare global {

  namespace Atlassian {

    interface JWT {
      aud?: string|Array<string>;
      sub: string;
      qsh: string;
      iss: string;
      context: Record<string, unknown>;
      exp: number;
      iat: number;
    }

    namespace Connect {

      namespace AppDescriptor {

        interface Webhook {
          key?: string;
          event: string;
          url: string;
          excludeBody?: boolean;
          filter?: string;
        }

      }

      interface EntityProperty<T> {
        key: string;
        value: T;
      }

    }

  }

  namespace Confluence {

    type EntityType = 'app'|'user'|'space'|'content';

    interface User {
      type: 'known'|'unknown'|'anonymous'|'user';
      username: string;
      userKey: string;
      accountId: string;
      accountType: 'atlassian'|'app';
      email: string;
      publicName: string;
      profilePicture: string;
      displayName: string;
      timeZone: string;
      isExternalCollaborator: boolean;
      externalCollaborator: boolean;
      operations?: Array<OperationCheckResult>|null;
    }

    interface UserArray {
      results: Array<User>;
      start?: number;
      limit?: number;
      size: number;
    }

    interface Group {
      id: string;
      type: 'group';
      name: string;
    }

    interface GroupArray {
      results: Array<Group>;
      start: number;
      limit: number;
      size: number;
    }

    interface Content {
      id?: string;
      type: 'page'|'blogpost'|'attachment'|'content';
      status: string;
      title?: string;
      space?: Space;
      history?: ContentHistory;
      version?: Version;
      ancestors?: Array<Content>;
      operations?: Array<OperationCheckResult>;
      children?: ContentChildren;
      childTypes?: ContentChildType;
      descendants?: ContentChildren;
      container?: unknown;
      body?: {
        view?: ContentBody;
        export_view?: ContentBody;
        styled_view?: ContentBody;
        storage?: ContentBody;
        wiki?: ContentBody;
        editor?: ContentBody;
        editor2?: ContentBody;
        anonymous_export_view?: ContentBody;
        atlas_doc_format?: ContentBody;
        dynamic?: ContentBody;
      };
      restrictions?: {
        read?: ContentRestriction;
        update?: ContentRestriction
      }
      metadata?: ContentMetadata;
      macroRenderedOutput?: unknown;
      extensions?: unknown;
      _links: Record<string, string>;
    }

    interface ContentBody {
      value: string;
      representation: 'view'|'export_view'|'styled_view'|'storage'|'editor'|'editor2'|'anonymous_export_view'|'wiki'|'atlas_doc_format';
      embeddedContent?: Array<EmbeddedContent>;
      webresource?: WebResourceDependencies;
      mediaToken?: {
        collectionIds?: Array<string>;
        contentId?: string;
        expiryDateTime?: string;
        fileIds?: Array<string>;
        token?: string;
      }
    }

    interface EmbeddedContent {
      entityId?: number;
      entityType?: string;
      entity?: unknown;
    }

    interface WebResourceDependencies {
      keys?: Array<string>;
      contexts?: Array<string>;
      uris?: {
        all?: Array<string>|string;
        css?: Array<string>|string;
        js?: Array<string>|string;
      };
      tags?: {
        all?: string;
        css?: string;
        data?: string;
        js?: string;
      };
      superbatch: {
        uris?: {
          all?: Array<string>|string;
          css?: Array<string>|string;
          js?: Array<string>|string;
        };
        tags?: {
          all?: string;
          css?: string;
          data?: string;
          js?: string;
        };
        metatags?: string;
      }
    }

    interface ContentRestriction {
      operation: ContentOperation;
      restrictions?: {
        user: UserArray;
        group: GroupArray;
      };
      content?: Content;
    }

    interface ContentMetadata {
      currentuser?: {
        favourited?: { isFavourite?: boolean; favouritedDate?: string; };
        lastmodified?: { version?: Version; friendlyLastModified?: string; };
        lastcontributed?: { status?: string; when?: string; };
        viewed?: { lastSeen?: string; friendlyLastSeen?: string; };
        scheduled?: unknown;
      }
      properties?: unknown;
      frontend?: unknown;
      labels?: LabelArray | Array<Label>;
    }

    interface ContentChildType {
      attachment: { value: boolean };
      comment: { value: boolean };
      page: { value: boolean };
    }

    interface ContentChildren {
      attachment?: ContentArray;
      comment?: ContentArray;
      page?: ContentArray;
    }

    interface ContentArray {
      results: Array<Content>;
      start?: number;
      limit?: number;
      size: number;
    }


    interface ContentHistory {
      latest: boolean;
      createdBy?: User;
      createdDate?: string;
      lastUpdated?: Version;
      previousVersion?: Version;
      contributors?: { publishers: UsersUserKeys; };
      nextVersion?: Version;
    }

    interface Version {
      by?: User;
      when: string;
      friendlyWhen?: string;
      message?: string;
      number: number;
      minorEdit: boolean;
      Content?: Content;
      collaborators?: UsersUserKeys;
      contentTypeModified?: boolean;
      confRev?: string;
      syncRev?: string;
      syncRevSource?: string;
    }

    interface UsersUserKeys {
      users?: Array<User>;
      userKeys: Array<string>;
    }

    interface MacroInstance {
      name: string;
      body: string;
      parameters: Record<string, { value: string }>;
      _links: {
        base: string;
        context: string;
      }
    }

    interface Space {
      id?: number;
      key: string;
      name: string;
      icon?: Icon;
      description?: {
        plain: SpaceDescription;
        view: SpaceDescription;
      };
      homepage?: Content;
      type: string;
      metadata?: {
        label: LabelArray;
      }
      operations?: Array<OperationCheckResult>|null;
      permissions?: Array<SpacePermission>|null;
      status: string;
      settings?: SpaceSettings;
      theme?: Theme;
      lookAndFeel?: LookAndFeel;
      history?: {
        createdDate: string;
        createdBy?: User;
      };
    }

    interface Icon {
      path: string;
      width: number;
      height: number;
      isDefault: boolean;
    }

    interface LabelArray {
      results: Array<Label>;
      start?: number;
      limit?: number;
      size: number;
    }

    interface Label {
      prefix: string;
      name: string;
      id: string;
      label: string;
    }

    interface SpaceDescription {
      value: string;
      representation: 'plain'|'view';
      embeddedContent: Array<Content>;
    }

    interface SpaceSettings {
      routeOverrideEnabled: boolean;
      editor: {
        page: string;
        blogpost: string;
        default: string;
      }
    }

    interface SpacePermission {
      id: number;
      subjects: {
        user: {
          results: Array<User>;
          size: number;
          start?: number;
          limit?: number;
        };
        group: {
          results: Array<Group>;
          size: number;
          start?: number;
          limit?: number;
        }
      };
      operation: OperationCheckResult;
      anonymousAccess: boolean;
      unlicensedAccess: boolean;
    }

    interface OperationCheckResult {
      operation: ContentOperation;
      targetType: 'application'|'page'|'blogpost'|'comment'|'attachment'|'space';
    }

    interface PermissionSubjectWithGroupId {
      type: 'user'|'group';
      identifier: string;
    }

    interface PermissionCheckResponse {
      hasPermission: boolean;
      errors?: Array<Message>;
    }

    interface Message {
      translation?: string;
      args: Array<string|unknown>;
    }

    interface Theme {
      themeKey: string;
      name?: string;
      description?: string;
      icon?: Icon;
    }

    interface LookAndFeel {
      headings: { color: string; };
      links: { color: string; };
      menus: MenusLookAndFeel;
      header: HeaderLookAndFeel;
      horizontalHeader?: HorizontalHeaderLookAndFeel;
      content: ContentLookAndFeel;
      bordersAndDividers: { color: string; };
      spaceReference?: unknown;
    }

    interface MenusLookAndFeel {
      hoverOrFocus: { backgroundColor: string; };
      color: string;
    }

    interface HeaderLookAndFeel {
      backgroundColor: string;
      button: ButtonLookAndFeel;
      primaryNavigation: NavigationLookAndFeel;
      secondaryNavigation: NavigationLookAndFeel;
      search: SearchFieldLookAndFeel;
    }

    interface ButtonLookAndFeel {
      backgroundColor: string;
      color: string;
    }

    interface NavigationLookAndFeel {
      color: string;
      highlightColor?: string;
      hoverOrFocus: {
        backgroundColor: string;
        color: string;
      }
    }

    interface SearchFieldLookAndFeel {
      backgroundColor: string;
      color: string;
    }

    interface HorizontalHeaderLookAndFeel {
      backgroundColor: string;
      button?: ButtonLookAndFeel;
      primaryNavigation: TopNavigationLookAndFeel;
      secondaryNavigation?: NavigationLookAndFeel;
      search?: SearchFieldLookAndFeel;
    }

    interface TopNavigationLookAndFeel {
      color?: string;
      highlightColor: string;
      hoverOrFocus: {
        backgroundColor: string;
        color: string;
      }
    }

    interface ContentLookAndFeel {
      screen?: ScreenLookAndFeel;
      container?: ContainerLookAndFeel;
      header?: ContainerLookAndFeel;
      body?: ContainerLookAndFeel;
    }

    interface ScreenLookAndFeel {
      background: string;
      backgroundAttachment?: string;
      backgroundBlendMode?: string;
      backgroundClip?: string;
      backgroundColor?: string;
      backgroundImage?: string;
      backgroundOrigin?: string;
      backgroundPosition?: string;
      backgroundRepeat?: string;
      backgroundSize?: string;
      layer?: { width: string; height: string };
      gutterTop?: string;
      gutterRight?: string;
      gutterBottom?: string;
      gutterLeft?: string;
    }

    interface ContainerLookAndFeel {
      background: string;
      backgroundAttachment?: string;
      backgroundBlendMode?: string;
      backgroundClip?: string;
      backgroundColor: string;
      backgroundImage: string;
      backgroundOrigin?: string;
      backgroundPosition?: string;
      backgroundRepeat?: string;
      backgroundSize: string;
      padding: string;
      borderRadius: string;
    }

    type ContentOperation = 'administer'|'archive'|'clear_permissions'|'copy'|'create'|'create_space'|'delete'|'export'|'move'|'purge'|'purge_version'|'read'|'restore'|'restrict_content'|'update'|'use';

  }

  namespace Jira {

    type EntityType = 'app'|'user'|'project'|'issue'|'comment';

    interface User extends ApplicationUser {}

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

    interface Changelog {
      id: string;
      items: Array<ChangelogItem>;
    }

    interface ChangelogItem {
      toString: string;
      to: string|null;
      fromString: string;
      from: string|null;
      fieldType: string;
      field: string;
    }

    interface BulkProjectPermissions {
      issues?: Array<number>;
      projects?: Array<number>;
      permissions: Array<string>;
    }

    interface BulkPermissionGrants {
      projectPermissions: Array<BulkProjectPermissionGrants>;
      globalPermissions: Array<string>;
    }

    interface BulkProjectPermissionGrants {
      permission: string;
      issues: Array<number>;
      projects: Array<number>;
    }

    interface IssueTypeWithStatus {
      self: string;
      id: string;
      name: string;
      subtask: boolean;
      statuses: Array<StatusDetails>;
    }

    interface StatusDetails {
      self: string;
      description: string;
      iconUrl: string;
      name: string;
      id: string;
      statusCategory: StatusCategory;
    }

    interface SearchResults {
      expand: string;
      startAt: number;
      maxResults: number;
      total: number;
      issues: Array<Issue>;
      warningMessages: Array<string>;
    }

    interface Issue {
      id: string;
      expand?: string;
      self?: string;
      key: string;
      renderedFields?: {
        description: string;
        attachments?: Array<Attachment>;
        comment?: Comments;
        timetracking?: TimeTracking;
        worklog: Worklogs;
        updated: string;
        created: string;
        duedate?: string;
        [key: string]: unknown | null;
      };
      names?: { [key: string]: string };
      schema?: { [key: string]: Schema };
      transitions?: Array<Transition>;
      editmeta?: Record<string, unknown>;
      changelog?: Record<string, unknown>;
      versionedRepresentations?: Record<string, unknown>;
      properties?: Record<string, unknown>;
      fields?: {
        parent?: {
          id: string;
          key: string,
          fields?: {
            issuetype: IssueTypeDetails;
            priority: Priority;
            status: Status;
            summary: string;
            [key: string]: unknown;
          }
        };
        summary: string;
        description: string;
        status: Status;
        issuetype: IssueTypeDetails;
        components: Array<Component>;
        versions: Array<Version>;
        fixVersions: Array<Version>;
        assignee: ApplicationUser;
        reporter: ApplicationUser;
        labels: Array<string>;
        project: Project;
        priority: Priority;
        updated: string;
        created: string;
        duedate?: string;
        resolution: Resolution;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }

    interface Priority {
      id: string;
      iconUrl: string;
      name: string;
      self: string;
    }

    interface IssueTypeDetails {
      self: string;
      id: string;
      description: string;
      iconUrl: string;
      name: string;
      subtask: boolean;
      avatarId: string;
      entityId: string;
      hierarchyLevel: number;
    }

    interface IssueTypeField {
      autoCompleteUrl: string;
      hasDefaultValue: boolean;
      key: string;
      name: string;
      operations: Array<'add'|'set'|'remove'>;
      required: boolean;
      schema: {
        type: string;
        system: string;
        custom: string;
        customId: string;
        items: string;
      };
      allowedValues: Array<IssueTypeFieldAllowedValues>
    }

    interface IssueTypeFieldAllowedValues {
      id: string;
      self: string;
      value: string;
    }

    interface TimeTracking {
      originalEstimate?: string;
      remainingEstimate?: string;
      timeSpent?: string;
      originalEstimateSeconds?: number;
      remainingEstimateSeconds?: number;
      timeSpentSeconds?: number;
    }

    interface Worklogs {
      maxResults: number;
      startAt: number;
      total: number;
      worklogs: Array<Worklog>;
    }

    interface Worklog {
      author: ApplicationUser;
      comment: string;
      created: string;
      id: string;
      issueId: string;
      self: string;
      started: string;
      timeSpent: string;
      timeSpentSeconds: string;
      updateAuthor: ApplicationUser;
      updated: string;
    }

    interface Schema {
      type: string;
      system: string;
      items?: string;
      custom?: string;
      customId?: number;
    }

    interface FieldDetails {
      id: string;
      name: string;
      custom: boolean;
      orderable: boolean;
      navigable: boolean;
      searchable: boolean;
      clauseNames: [string]
      schema: Schema;
    }

    interface Field extends Pick<FieldDetails, 'id'|'name'|'schema'> {
      key: string;
      description: string;
      isLocked: boolean;
      isUnscreenable: boolean;
      searcherKey: string;
      screensCount: number;
      contextsCount: number;
      projectsCount: number;
      lastUsed: {
        type: 'TRACKED'|'NOT_TRACKED'|'NO_INFORMATION'
        value: string;
      }
    }

    interface IssueRequestOptions {
      fields?: Array<string>;
      fieldsByKeys?: boolean;
      expand?: string;
      properties?: Array<string>;
      updateHistory?: boolean;
    }

    interface IssueCreateMetadata {
      expand: string;
      projects: Array<ProjectIssueCreateMetadata>;
    }

    interface ProjectIssueCreateMetadata {
      self: string;
      expand: string;
      id: string;
      key: string;
      name: string;
      avatarUrls: Record<'16x16'|'24x24'|'32x32'|'48x48', string>;
      issuetypes: Array<IssueTypeIssueCreateMetadata>;
    }

    interface IssueTypeIssueCreateMetadata extends IssueTypeDetails {
      scope: Scope;
      expand: string;
      fields: Record<string, IssueTypeField>;
    }

    interface CreatedIssue {
      id: string;
      key: string;
      self: string;
      transition: unknown;
    }

    interface IssueRequest {
      transition?: unknown;
      fields?: unknown;
      update?: unknown;
      historyMetadata?: unknown;
      properties?: unknown;
    }

    interface EditIssueRequestParameters {
      notifyUsers?: boolean;
      overrideScreenSecurity?: boolean;
      overrideEditableFlag?: boolean;
    }

    interface IssueFieldOption {
      id: number;
      value: string;
      properties?: Record<string, string>;
      config?: IssueFieldOptionConfiguration;
    }

    interface IssueFieldOptionConfiguration {
      scope: IssueFieldOptionScope;
    }

    interface IssueFieldOptionScope {
      projects2?: Array<ProjectScope>;
      global?: GlobalScope;
    }

    interface ProjectScope {
      id: number;
      attributes?: Array<'notSelectable'|'defaultValue'>;
    }

    interface GlobalScope {
      id: number;
      attributes?: Array<'notSelectable'|'defaultValue'>;
    }

    interface Version {
      self: string;
      id?: string;
      name: string;
      description: string;
      archived: boolean;
      released: boolean;
      releaseDate: string;
      overdue: boolean;
      userReleaseDate: string;
      projectId: number;
      startDate: string;
      issuesStatusForFixVersion?: VersionIssuesStatus;
    }

    interface CreateVersionRequest {
      archived?: boolean;
      description?: string;
      name: string;
      projectId: number;
      releaseDate?: string|null;
      startDate?: string|null;
      expand?: Array<'operations'|'issuesstatus'>;
    }

    interface UpdateVersionRequest extends Pick<CreateVersionRequest, 'archived'|'description'|'releaseDate'|'startDate'|'expand'> {
      name?: string;
      released?: boolean;
      moveUnfixedIssuesTo?: string;
    }

    interface DeleteVersionRequest {
      customFieldReplacementList?: Array<CustomFieldReplacement>;
      moveAffectedIssuesTo?: number;
      moveFixIssuesTo?: number;
    }

    interface CustomFieldReplacement {
      customFieldId: number;
      moveTo: number;
    }

    interface VersionWithIssueStatus extends Omit<Version, 'issuesStatusForFixVersion'> {
      issuesStatusForFixVersion: VersionIssuesStatus;
    }

    interface VersionIssuesStatus {
      unmapped: number;
      toDo: number;
      inProgress: number;
      done: number;
    }

    interface VersionIssueCounts {
      self?: string;
      issuesFixedCount: number;
      issuesAffectedCount: number;
      issueCountWithCustomFieldsShowingVersion: number;
      customFieldUsage: Array<VersionUsageInCustomField>;
    }

    interface VersionUsageInCustomField {
      fieldName: string;
      customFieldId: number;
      issueCountWithVersionInCustomField: number;
    }

    interface Status {
      self: string;
      id: string;
      description: string;
      iconUrl: string;
      name: string;
      statusCategory: StatusCategory;
    }

    interface StatusCategory {
      self: string;
      id: number;
      key: string;
      colorName: string;
      name: string;
    }

    interface Component {
      self: string;
      id?: string;
      name: string;
      description: string;
      lead: ApplicationUser;
      leadAccountId: string;
      assigneeType: ComponentAssigneeType;
      assignee: ApplicationUser;
      realAssigneeType: string;
      realAssignee: ApplicationUser;
      isAssigneeTypeValid: boolean;
      project: string;
      projectId: number;
    }

    type ComponentAssigneeType = 'COMPONENT_LEAD'|'PROJECT_LEAD'|'PROJECT_DEFAULT'|'UNASSIGNED';

    interface CreateComponentRequest {
      name: string;
      description?: string;
      leadAccountId?: string;
      assigneeType: ComponentAssigneeType;
      project: string;
    }

    interface UpdateComponentRequest {
      name?: string;
      description?: string;
      leadAccountId?: string;
      assigneeType: ComponentAssigneeType;
    }

    interface ComponentIssuesCount {
      self?: string;
      issueCount: number;
    }

    interface Comments {
      comments: Array<Comment>;
      maxResults: number;
      total: number;
      startAt: number;
    }

    interface Attachment {
      self: string;
      id: string;
      filename: string;
      author: ApplicationUser;
      created: string;
      size: number;
      mimeType: string;
      content: string;
      thumbnail: string;
    }

    interface Resolution {
      id: string;
      name: string;
      description: string;
    }

    interface Transition {
      id: string;
      name: string;
      toe: TransitionTo;
    }

    interface TransitionTo {
      self: string;
      description: string;
      iconUrl: string;
      name: string;
      id: string;
      statusCategory: TransitionStatusCategory;
      hasScreen: boolean;
      isGlobal: boolean;
      isInitial: boolean;
      isAvailable: boolean;
      isConditional: boolean;
    }

    interface TransitionStatusCategory {
      self: string;
      id: string;
      key: string;
      colorName: string;
      name: string;
    }

    interface ApplicationUser {
      self: string;
      name: string;
      avatarUrls: {
        [key: string]: string;
      };
      displayName: string;
      active: boolean;
      key: string;
      accountId: string;
      accountType: string;
      timeZone?: string;
    }

    interface UnrestrictedUserEmail {
      accountId: string;
      email: string;
    }

    interface FoundUsers {
      users: Array<UserPickerUser>;
      total: number;
      header: string;
    }

    interface UserPickerUser {
      accountId: string;
      accountType: string;
      html: string;
      displayName: string;
      avatarUrl: string;
    }

    interface PagedOfProjects {
      nextPage: string;
      maxResults: number;
      startAt: number;
      total: number;
      isLast: boolean;
      values: Array<Project>;
    }

    interface Project extends ProjectDetails {
      archived: boolean;
      style?: 'classic'|'next-gen';
      description: string;
      issueTypes: Array<IssueTypeDetails>;
      lead: User;
      issueTypeHierarchy: unknown;
      properties: Record<string, unknown>;
    }

    interface ProjectDetails {
      self: string;
      id: string;
      key: string;
      name: string;
      avatarUrls: Record<string, string>;
      simplified?: boolean;
      projectTypeKey: 'software'|'service_desk'|'business';
      projectCategory: ProjectCategory;
    }

    interface ProjectCategory {
      self: string;
      id: string;
      description: string;
      name: string;
    }

    interface ProjectRole {
      self: string;
      name: string;
      id: number;
      description: string;
      actors: Array<RoleActor>;
      scope: Scope;
      translatedName: string;
      currentUserRole: boolean;
      admin: boolean;
      roleConfigurable: boolean;
      default: boolean;
    }

    interface RoleActor {
      id: number;
      displayName: string;
      type: string;
      name: string;
      avatarUr:string;
      actorUser: ProjectRoleUser;
      actorGroup: ProjectRoleGroup;
    }

    interface ProjectRoleUser {
      accountId: string;
    }

    interface ProjectRoleGroup {
      displayName: string;
      name: string;
      groupId: string;
    }

    interface Scope {
      type: string;
      project: ProjectDetails;
    }

    interface PageOfComments {
      startAt: number;
      maxResults: number;
      total: number;
      comments: Array<Comment>;
    }

    interface GetCommentRequestParameters {
      expand: string;
    }

    interface Comment {
      self: string;
      id: string;
      author: ApplicationUser;
      body: unknown;
      renderedBody: string;
      updateAuthor: ApplicationUser;
      created: string;
      updated: string;
      visibility: Visibility;
      jsdPublic: boolean;
      properties: Array<Atlassian.Connect.EntityProperty<unknown>>;
    }

    interface Visibility {
      type: 'group'|'role';
      value: string;
    }

    interface PagedResponse<T> {
      size: number;
      start: number;
      limit: number;
      isLastPage: boolean;
      values: Array<T>;
    }

    interface PagedResponse2<T> {
      self: string;
      nextPage: string;
      maxResults: number;
      startAt: number;
      total: number;
      isLast: boolean;
      values: Array<T>;
    }

    interface Servicedesk {
      id: string;
      projectId: string;
      projectName: string;
      projectKey: string;
    }

    interface Customer {
      accountId: string;
      name: string;
      key: string;
      emailAddress: string;
      displayName: string;
      active: string;
      timeZone: string;
    }

    interface CustomerRequestType {
      _links: Record<string, string>;
      requestType: RequestType;
      currentStatus: CurrentStatus;
    }

    interface RequestType {
      id: string;
      name: string;
      description: string;
      helpText: string;
      issueTypeId: string;
      serviceDeskId: string;
      groupIds: Array<string>;
      icon: RequestTypeIcon;
      fields: CustomerRequestCreateMeta;
      portalId: string;
    }

    interface CurrentStatus {
      status: string;
      statusCategory: string;
      statusDate: {
          iso8601: string;
          jira: string;
          friendly: string;
          epochMillis: number;
      }
    }

    interface RequestTypeIcon {
      id: string;
      _links: Array<RequestTypeIconLink>;
    }

    interface RequestTypeIconLink {
      iconUrls: unknown;
    }

    interface CustomerRequestCreateMeta {
      requestTypeFields: Array<RequestTypeField>;
      canRaiseOnBehalfOf: boolean;
      canAddRequestParticipants: boolean;
    }

    interface RequestTypeField {
      fieldId: string;
      name: string;
      description: string;
      required: boolean;
      defaultValues: Array<RequestTypeFieldValueDTO>;
      validValues: Array<RequestTypeFieldValueDTO>;
    }

    interface RequestTypeFieldValueDTO {
      value: string;
      label: string;
      children: Array<RequestTypeFieldValueDTO>;
    }

    interface Release extends Omit<Version, 'releaseDate'|'startDate'> {
      operations: Array<{ href: string, label: string, styleClass: string }>;
      releaseDate: { formatted: string, iso: string, datePickerFormatted: string };
      startDate: { formatted: string, iso: string, datePickerFormatted: string };
      status: {
        [key in 'complete'|'inProgress'|'toDo'|'unmapped']: {
          count: number;
          jqlUrl: string;
        }
      };
      url: string;
    }

    interface Board {
      id: number;
      self: string;
      name: string;
      type: string;
      admins: {
        users: Array<Jira.ApplicationUser>;
        groups: Array<{ name: string; self: string }>
      };
      location: {
        projectId: number;
        userId: number;
        userAccountId: string;
        displayName: string;
        projectName: string;
        projectKey: string;
        projectTypeKey: string;
        avatarURI: string;
        name: string;
      };
      canEdit: boolean;
      isPrivate: boolean;
      favourite: boolean;
    }

    interface Features {
      features: Array<Feature>;
    }

    interface Feature {
      boardFeature: 'SIMPLE_ROADMAP'|'BACKLOG'|'SPRINTS'|'DEVTOOLS'|'REPORTS'|'ESTIMATION'|'PAGES'|'CODE'|'RELEASES'|'DEPLOYMENTS'|'ISSUE_NAVIGATOR'|'ON_CALL_SCHEDULE';
      boardId: number;
      state: 'ENABLED'|'DISABLED'|'COMING_SOON';
      localisedName: string;
      localisedDescription: string;
      learnMoreLink: string;
      imageUri: string;
      toggleLocked: boolean;
      feature: string;
    }

    interface Sprint {
      id: number;
      self: string;
      state: 'future'|'closed'|string;
      name: string;
      startDate: string;
      endDate: string;
      originBoardId: number;
    }

    interface IssuesForSprint {
      expand: string;
      startAt: number;
      maxResults: number;
      total: number;
      issues: Array<Issue>;
    }

    type Webhooks =
      'jira:issue_created' |
      'jira:issue_updated' |
      'jira:issue_deleted' |
      'issue_property_set' |
      'issue_property_deleted' |
      'worklog_created' |
      'worklog_updated' |
      'worklog_deleted' |
      'comment_created' |
      'comment_updated' |
      'comment_deleted' |
      'attachment_created' |
      'attachment_deleted' |
      'issuelink_created' |
      'issuelink_deleted' |
      'project_created' |
      'project_updated' |
      'project_deleted' |
      'project_soft_deleted' |
      'project_restored_deleted' |
      'project_archived' |
      'project_restored_archived' |
      'jira:version_released' |
      'jira:version_unreleased' |
      'jira:version_created' |
      'jira:version_moved' |
      'jira:version_updated' |
      'jira:version_deleted' |
      'user_created' |
      'user_updated' |
      'user_deleted' |
      'option_voting_changed' |
      'option_watching_changed' |
      'option_unassigned_issues_changed' |
      'option_subtasks_changed' |
      'option_attachments_changed' |
      'option_issuelinks_changed' |
      'option_timetracking_changed' |
      'sprint_created' |
      'sprint_deleted' |
      'sprint_updated' |
      'sprint_started' |
      'sprint_closed' |
      'board_created' |
      'board_updated' |
      'board_deleted' |
      'board_configuration_changed' |
      'jira_expression_evaluation_failed'

    interface WebhookEvent {
      timestamp: number;
      webhookEvent: Webhooks;
    }

    interface IssueWebhookEvent extends WebhookEvent {
      webhookEvent: 'jira:issue_created'|'jira:issue_updated'|'jira:issue_deleted';
      issue: Issue;
      user: ApplicationUser;
      changelog: Changelog;
    }

    interface CommentWebhookEvent extends WebhookEvent {
      webhookEvent: 'comment_created'|'comment_updated'|'comment_deleted';
      issue: Issue;
      comment: Comment;
    }

    interface SprintWebhookEvent extends WebhookEvent {
      webhookEvent: 'sprint_created'|'sprint_deleted'|'sprint_updated'|'sprint_started'|'sprint_closed';
      sprint: Sprint;
    }

    interface Changelog {
      id: string;
      items: Array<ChangelogItem>;
    }

    interface ChangelogItem {
      toString: string;
      to: string|null;
      fromString: string;
      from: string|null;
      field: string;
      fieldtype: string;
      fieldId: string;
    }

    type DynamicModules = 'jiraEntityProperties'|'jiraIssueFields'|'webhooks'|'webPanels'|'webItems'|'webSections';

    interface DynamicModulesRequest extends Partial<Record<DynamicModules, Array<JiraEntityPropertyModule|JiraIssueFieldModule|WebhookModule|WebPanelModule|WebItemModule|WebSectionModule>>> {
      jiraEntityProperties?: Array<JiraEntityPropertyModule>;
      jiraIssueFields?: Array<JiraIssueFieldModule>;
      webhooks?: Array<WebhookModule>;
      webPanels?: Array<WebPanelModule>;
      webItems?: Array<WebItemModule>;
      webSections?: Array<WebSectionModule>;
    }

    interface JiraEntityPropertyModule {
      key: string;
      name: { value: string; i18n?: string; };
      entityType?: 'issue'|'user'|'project';
      keyConfigurations?: Array<IndexKeyConfiguration>;
    }

    interface IndexKeyConfiguration {
      propertyKey: string;
      extractions: Array<PropertyIndex>;
    }

    interface PropertyIndex {
      objectName: string;
      type: 'number'|'text'|'string'|'user'|'date';
      alias?: string;
    }

    interface JiraIssueFieldModule {
      key: string;
      description: { value: string; i18n?: string; };
      name: { value: string; i18n?: string; }
      type: 'string'|'text'|'rich_text'|'single_select'|'multi_select'|'number'|'read_only';
      extractions?: Array<IssueFieldOptionPropertyIndex>;
      property?: Array<IssueFieldProperty>;
      template?: IssueFieldTemplate;
    }

    interface IssueFieldOptionPropertyIndex {
      path: string;
      type: 'number'|'text'|'string'|'user'|'date';
      name?: string;
    }

    interface IssueFieldProperty {
      key: string;
      path: string;
      type: 'number'|'string'|'date';
    }

    interface IssueFieldTemplate {
      type: string;
      url: string;
    }

    interface WebhookModule {
      key: string;
      event: Webhooks,
      url: string;
      excludeBody?: boolean;
      filter?: string;
      propertyKeys?: Array<string>;
    }

    interface WebPanelModule {
      key: string;
      location: string;
      name: { value: string; i18n?: string; };
      url: string;
      cacheable?: boolean;
      conditions?: Array<SingleCondition|CompositeCondition>;
      layout?: { height: string; width: string; };
      params?: Record<string, string>;
      supportsNative?: boolean;
      tooltip?: { value: string; i18n?: string };
      weight?: number;
    }

    interface WebItemModule {
      key: string;
      url?: string;
      location: string;
      name: { value: string; i18n?: string; };
      cacheable?: boolean;
      conditions?: Array<SingleCondition|CompositeCondition>;
      context?: 'page'|'addon'|'product';
      icon?: { url: string; height: number; width: number; }
      params?: Record<string, string>;
      styleClasses?: Array<string>;
      target?: {
        type?: 'page'|'dialog'|'inlinedialog'|'dialogmodule';
        options?: InlineDialogOptions|DialogOptions|DialogModuleOptions;
      }
      tooltip?: { value: string; i18n?: string };
      weight?: number;
    }

    interface InlineDialogOptions {
      closeOthers?: boolean;
      isRelativeToMouse?: boolean;
      offsetX?: string;
      offsetY?: string;
      onHover?: boolean;
      onTop?: boolean;
      persistent?: boolean;
      showDelay?: number;
      width?: string;
    }

    interface DialogOptions {
      chrome?: boolean;
      header?: { value: string; i18n?: string };
      size?: 'small'|'medium'|'large'|'x-large'|'fullscreen'|'maximum';
      height?: string;
      width?: string;
    }

    interface DialogModuleOptions {
      key: string;
    }

    interface WebSectionModule {
      key: string;
      location: string;
      name: { value: string; i18n?: string; };
      conditions?: Array<SingleCondition|CompositeCondition>;
      params: Record<string, string>;
      tooltip?: { value: string; i18n?: string };
      weight?: number;
    }

    interface SingleCondition {
      condition: string;
      invert?: boolean;
      params?: Record<string, string>;
    }

    interface CompositeCondition extends Partial<Record<'or'|'and', Array<SingleCondition|CompositeCondition>>> {}

  }

  namespace Bitbucket {

    interface Paginated<T> {
      start: number;
      size: number;
      total: number;
      values: Array<T>;
      isLastPage: boolean;
      nextPageStart: number;
    }

    interface Page<T> {
      size: number;
      page: number;
      pagelen: number;
      next: string;
      previous: string;
      values: Array<T>;
    }

    interface Account {
      uuid: string
      username: string;
      nickname: string;
      account_status: string;
      display_name: string;
      website: string;
      has_2fa_enabled: boolean;
      location: string;
      created_on: string;
      links: {
        avatar: {href: string; }
      }
    }

    interface User {
      name: string;
      emailAddress: string;
      id: number;
      account_id: string;
      displayName: string;
      active: boolean;
      slug: string;
      type: string;
    }

    interface Project {
      key: string;
      id: number;
      name: string;
      description: string;
      public: boolean;
      type: string;
    }

    interface Repository {
      slug: string;
      id: number;
      uuid: string;
      name: string;
      full_name: string;
      description: string;
      hierarchyId: string;
      scm: 'git';
      scmId: string;
      state: string;
      statusMessage: string;
      forkable: boolean;
      project: Project;
      public: boolean;
      is_private: boolean;
      created_on: string;
      updated_on: string;
      parent: Repository;
      owner: Account;
      size: number;
      language: string;
      has_issues: boolean;
      has_wiki: string;
      fork_policy: 'allow_forks'|'no_public_forks'|'no_forks';
      mainbranch: Ref & Branch;
      workspace: Workspace;
    }

    interface Workspace {
      links: Record<string, { href: string; }>;
      name: string;
      slug: string;
      type: 'workspace'
      uuid: string;
    }

    interface Ref {
      id: string;
      name: string;
      displayId: string;
      type: 'BRANCH'|'TAG';
      latestCommit: string;
      latestChangeset: string;
      target: BaseCommit & {
        repository: Repository;
        particpants: Array<{
          user: Account & User;
          role: 'PARTICIPANT'|'REVIEWER';
          approved: boolean;
          state: 'approved'|'changes_requested'|null;
          participated_on: string;
        }>
      };
    }

    interface Branch extends Ref {
      isDefault: boolean;
    }

    interface Tag extends Ref {
      hash: string;
    }

    interface BaseCommit {
      type: string;
      hash: string;
      date: string;
      author: {
        raw: string;
        user: Account;
      };
      message: string;
      summery: string;
      parents: Array<BaseCommit>;
    }

    interface Commit {
      id: string;
      displayId: string;
      author: {
        name: string;
        emailAddress: string;
      },
      authorTimestamp: number;
      committer: {
        name: string;
        emailAddress: string;
      },
      committerTimestamp: number,
      message: string;
      parents: Array<{ id: string; displayId: string; }>;
    }

  }

  namespace UPM {

    interface App {
      version: string;
    }

  }

}

export {}