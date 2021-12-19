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

    }

  }

  namespace Confluence {

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
        summary: string;
        description: string;
        status: Status;
        issuetype: IssueType;
        components: Array<Component>;
        versions: Array<Version>;
        fixVersions: Array<Version>;
        reporter: Reporter;
        labels: Array<string>;
        project: Project;
        priority: Priority;
        updated: string;
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

    interface IssueType {
      avatarId: number;
      description: string;
      entityId: string;
      iconUrl: string;
      id: string;
      name: string;
      self: string;
      subtask: boolean;
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

    interface IssueRequestOptions {
      fields?: Array<string>;
      fieldsByKeys?: boolean;
      expand?: string;
      properties?: Array<string>;
      updateHistory?: boolean;
    }

    interface Reporter {
      self: string;
      accountId: string;
      avatarUrls: { [key: string]: string };
      displayName: string;
      active: boolean;
      timeZone: string;
      accountType: string;
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
      assigneeType: 'COMPONENT_LEAD'|'PROJECT_LEAD'|'PROJECT_DEFAULT'|'UNASSIGNED';
      assignee: ApplicationUser;
      realAssigneeType: string;
      realAssignee: ApplicationUser;
      isAssigneeTypeValid: boolean;
      project: string;
      projectId: number;
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

    interface Project {
      self: string;
      id: string;
      key: string;
      name: string;
      avatarUrls: {
        [key: string]: string;
      };
      archived: boolean;
      simplified?: boolean;
      style?: 'classic'|'next-gen';
      projectTypeKey?: 'software'|'service_desk'|'business';
    }

    interface EditIssueRequestParameters {
      notifyUsers?: boolean;
      overrideScreenSecurity?: boolean;
      overrideEditableFlag?: boolean;
    }

    interface EditIssueRequest {
      transition?: unknown;
      fields?: unknown;
      update?: unknown;
      historyMetadata?: unknown;
      properties?: unknown;
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
      properties: Array<EntityProperty<unknown>>;
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


    interface EntityProperty<T> {
      key: string;
      value: T;
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

  }

  namespace UPM {

    interface App {
      version: string;
    }

  }

}

export {}