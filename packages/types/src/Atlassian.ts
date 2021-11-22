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
      sub: string;
      qsh: string;
      iss: string;
      context: Record<string, unknown>;
      exp: number;
      iat: number;
    }

  }

  namespace Confluence {

    interface User extends Record<string, unknown> {}

    interface GroupArray {
      results: Array<Group>;
      start: number;
      limit: number;
      size: number;
    }

    interface Group {
      id: string;
      type: 'group';
      name: string;
    }

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
      id: string;
      description: string;
      name: string;
      archived: boolean;
      released: boolean;
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
      id: string;
      name: string;
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

    interface JWT {
      sub: string;
      qsh: string;
      iss: string;
      context: Record<string, unknown>;
      exp: number;
      iat: number;
    }


  }

  namespace UPM {

    interface App {
      version: string;
    }

  }

}

export {}