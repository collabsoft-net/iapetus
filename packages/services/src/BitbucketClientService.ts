import { BitbucketCloudEndpoints, BitbucketServerEndpoints, Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { RestClient } from '@collabsoft-net/types';
import { injectable } from 'inversify';

import { AbstractAtlasClientService } from '.';

type UserOrAccount<T extends Modes> = T extends Modes.CONNECT|Modes.FORGE ? Bitbucket.Account : Bitbucket.User;
type BranchModelOrBranchingModelSettings<T extends Modes> = T extends Modes.CONNECT|Modes.FORGE ? Bitbucket.BranchingModelSettings : Bitbucket.BranchModel;
type CommitOrBaseCommit<T extends Modes> = T extends Modes.CONNECT|Modes.FORGE ? Bitbucket.Page<Bitbucket.BaseCommit> : Bitbucket.Paginated<Bitbucket.Commit>;

@injectable()
export class BitbucketClientService<Mode extends Modes> extends AbstractAtlasClientService<Mode> {

  constructor(protected client: RestClient, protected mode: Mode) {
    super(client, mode);
    this.endpoints = (mode === Modes.CONNECT || mode === Modes.FORGE) ? BitbucketCloudEndpoints : BitbucketServerEndpoints;
  }

  cached(duration: number) {
    return this.getInstance(this.client.cached(duration), this.mode);
  }

  async user(): Promise<UserOrAccount<Mode>>;
  async user(accountId: string): Promise<UserOrAccount<Mode>>;
  async user(accountId: number): Promise<UserOrAccount<Mode>>;
  async user(accountId?: string|number): Promise<UserOrAccount<Mode>> {
    if (this.mode === Modes.P2) {
      if (!accountId) {
        throw new Error('This method is not available for Atlassian Bitbucket Data Center');
      }

      const result = await this.client.get<Bitbucket.User>(this.getEndpointFor(this.endpoints.USER, { accountId: `${accountId}` })).then(({data}) => data);
      return result as UserOrAccount<Mode>;
    } else {
      const result = accountId
        ? await this.client.get<Bitbucket.Account>(this.getEndpointFor(this.endpoints.USER, { accountId: `${accountId}` })).then(({data}) => data)
        : await this.client.get<Bitbucket.Account>(this.getEndpointFor(this.endpoints.USER)).then(({data}) => data);
      return result as UserOrAccount<Mode>;
    }
  }

  async seats(workspaceIdentifier: string): Promise<number> {
    if (this.mode === Modes.P2) {
      throw new Error('This method is not available for Atlassian Bitbucket Data Center');
    }
    return this.getSeatsPaginated(workspaceIdentifier);
  }

  async repository(projectKey: string, slug: string): Promise<Bitbucket.Repository>;
  async repository(workspaceSlugOrUUID: string, slug: string): Promise<Bitbucket.Repository>;
  async repository(owner: string, slug: string): Promise<Bitbucket.Repository> {
    const { data } = await this.client.get<Bitbucket.Repository>(this.getEndpointFor(this.endpoints.REPOSITORY, { owner, slug }));
    return data;
  }

  async branchingModel(projectKey: string, slug: string): Promise<BranchModelOrBranchingModelSettings<Mode>>;
  async branchingModel(workspaceSlugOrUUID: string, slug: string): Promise<BranchModelOrBranchingModelSettings<Mode>>;
  async branchingModel(owner: string, slug: string): Promise<BranchModelOrBranchingModelSettings<Mode>> {
    if (this.mode === Modes.CONNECT || this.mode === Modes.FORGE) {
      const { data } = await this.client.get<Bitbucket.BranchingModelSettings>(this.getEndpointFor(this.endpoints.BRANCH_MODEL, { owner, slug }));
      return data as BranchModelOrBranchingModelSettings<Mode>;
    } else {
      const { data } = await this.client.get<Bitbucket.BranchModel>(this.getEndpointFor(this.endpoints.BRANCH_MODEL, { owner, slug }));
      return data as BranchModelOrBranchingModelSettings<Mode>;
    }
  }

  async defaultBranch(projectKey: string, slug: string): Promise<Bitbucket.Branch>;
  async defaultBranch(workspaceSlugOrUUID: string, slug: string): Promise<Bitbucket.Branch>;
  async defaultBranch(owner: string, slug: string): Promise<Bitbucket.Branch> {
    if (this.mode === Modes.CONNECT || this.mode === Modes.FORGE) {
      const repository = await this.repository(owner, slug);
      return this.branch(owner, slug, repository.mainbranch.name);
    } else {
      const { data } = await this.client.get<Bitbucket.Branch>(this.getEndpointFor(this.endpoints.DEFAULT_BRANCH, { owner, slug }));
      return data;
    }
  }

  async branch(workspaceSlugOrUUID: string, repositorySlugOrUUID: string, name: string): Promise<Bitbucket.Branch> {
    if (this.mode === Modes.P2) {
      throw new Error('This method is not available for Atlassian Bitbucket Data Center');
    }

    const { data } = await this.client.get<Bitbucket.Branch>(this.getEndpointFor(this.endpoints.BRANCH, { owner: workspaceSlugOrUUID, slug: repositorySlugOrUUID, name }));
    return data;
  }

  async branches(projectKey: string, slug: string): Promise<Bitbucket.Page<Bitbucket.Branch>>;
  async branches(workspaceSlugOrUUID: string, slug: string): Promise<Bitbucket.Page<Bitbucket.Branch>>;
  async branches(owner: string, slug: string): Promise<Bitbucket.Page<Bitbucket.Branch>> {
    const result = await this.fetchAll<Bitbucket.Branch>(this.getEndpointFor(this.endpoints.BRANCHES, { owner, slug }));
    return result;
  }

  async tags(projectKey: string, slug: string): Promise<Bitbucket.Page<Bitbucket.Tag>>;
  async tags(workspaceSlugOrUUID: string, slug: string): Promise<Bitbucket.Page<Bitbucket.Tag>>;
  async tags(owner: string, slug: string): Promise<Bitbucket.Page<Bitbucket.Tag>> {
    const result = await this.fetchAll<Bitbucket.Tag>(this.getEndpointFor(this.endpoints.TAGS, { owner, slug }));
    return result;
  }

  // BitBucket API does not support retrieving list of commit from SHA marker
  // As such, we can only properly support BitBucket by retrieving all commits for now
  async commits(projectKey: string, slug: string, until?: string): Promise<CommitOrBaseCommit<Mode>>;
  async commits(workspaceSlugOrUUID: string, slug: string, revision?: string): Promise<CommitOrBaseCommit<Mode>>;
  async commits(owner: string, slug: string, marker?: string): Promise<CommitOrBaseCommit<Mode>> {
    if (this.mode === Modes.CONNECT || this.mode === Modes.FORGE) {
      const { data } = await this.client.get<Bitbucket.Page<Bitbucket.BaseCommit>>(this.getEndpointFor(this.endpoints.COMMITS, { owner, slug, revision: marker || '' }))
      return data as CommitOrBaseCommit<Mode>;
    } else {
      const { data } = await this.client.get<Bitbucket.Paginated<Bitbucket.Commit>>(this.getEndpointFor(this.endpoints.COMMITS, { owner, slug }), { limit: 200, until: marker });
      return data as CommitOrBaseCommit<Mode>;
    }
  }

  private async getSeatsPaginated(workspace: string|number, next?: string) {
    let result = 0;
    const url = next ? next : this.getEndpointFor(this.endpoints.WORKSPACE_MEMBERS, { workspace: `${workspace}` });
    const { data } = await this.client.get<Bitbucket.Page<unknown>>(url);
    if (data.size && data.size > 0) {
      return data.size;
    } else {
      result = data.pagelen;
      if (result <= 10000 && data.next) {
        result += await this.getSeatsPaginated(workspace, data.next);
      }
    }
    return result;
  }

  private async fetchAll<T>(url: string, start?: number): Promise<Bitbucket.Page<T>> {
    const { data } = start
      ? await this.client.get<Bitbucket.Page<T>|Bitbucket.Paginated<T>>(url, { start })
      : await this.client.get<Bitbucket.Page<T>|Bitbucket.Paginated<T>>(url);

    const values: Array<T> = data.values.slice();
    if (isOfType<Bitbucket.Page<T>>(data, 'next')) {
      const result = await this.fetchAll<T>(data.next);
      values.push(...result.values);
    } else if (isOfType<Bitbucket.Paginated<T>>(data, 'isLastPage') && !data.isLastPage) {
      const result = await this.fetchAll<T>(url, data.nextPageStart);
      values.push(...result.values);
    }

    return {
      size: values.length,
      page: 0,
      pagelen: 0,
      next: '',
      previous: '',
      values
    }
  }

  listDynamicModules(): Promise<unknown> {
    throw new Error('This method is not available for Atlassian Bitbucket');
  }
  registerDynamicModule(): Promise<void> {
    throw new Error('This method is not available for Atlassian Bitbucket');
  }

  protected getInstance(client: RestClient, mode: Mode): BitbucketClientService<Mode> {
    return new BitbucketClientService(client, mode);
  }

  static getIdentifier(): symbol {
    return Symbol.for('BitbucketClientService');
  }

}
