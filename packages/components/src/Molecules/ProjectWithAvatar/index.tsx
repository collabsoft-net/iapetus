import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import React from 'react';
import styled from 'styled-components';

import { Column, Grid, GridProps, Link, Paragraph, Row, withProps } from '../../Atoms/';
import { JiraProviders } from '../../index';

const Wrapper = withProps<{ inline?: boolean }>()(styled(Grid))`
  display: ${props => props.inline ? 'inline-flex' : 'flex'};
  align-items: ${props => props.inline ? 'baseline' : 'center'};
`;

const AvatarWrapper = styled(Row)`
  display: inline-block;
  line-height: 0;
  align-self: center;
`;

export type ProjectWithAvatarProps = {
  size?: SizeType;
  isValidating?: boolean;
  isDisabled?: boolean;
  project?: Jira.Project;
  projectId?: number|string|PromiseLike<string|number>;
  inline?: boolean
  shouldFitContainer?: boolean;
  truncate?: boolean;
  href?: string;
  component?: (state: ProjectWithAvatarState) => JSX.Element;
  components?: {
    Avatar?: (state: ProjectWithAvatarState) => JSX.Element;
    Name?: (state: ProjectWithAvatarState) => JSX.Element;
  }
  onError?: () => void;
};

interface ProjectWithAvatarState {
  project?: Jira.Project|null;
  isLoading: boolean;
  isValidating?: boolean;
  isArchived?: boolean;
}

const Content = ({ project, size, href, inline, truncate, isValidating, isDisabled, loading, components, shouldFitContainer, ...rest }: Omit<ProjectWithAvatarProps, 'projectId'|'component'|'onError'> & GridProps & { loading?: boolean }) => (
  <Wrapper inline={inline} vertical {...rest}>
    <AvatarWrapper>
      {(() => {
        if (loading || isValidating) {
          return <Spinner size='medium' />;
        } else if (components?.Avatar) {
          return components.Avatar({ project, isLoading: false, isValidating, isArchived: project?.archived })
        } else if (!project || !isOfType<Jira.Project>(project, 'avatarUrls')) {
          return <WarningIcon label='Project not found' />;
        } else {
          return <Avatar appearance='square' src={ project.avatarUrls['32x32'] } size={ size || 'xsmall' } isDisabled={ isDisabled || project?.archived } />;
        }
      })()}
    </AvatarWrapper>
    <Column stretched={ shouldFitContainer }>
      {(() => {
        if (!loading && !isValidating) {
          if (components?.Name) {
            return components.Name({ project, isLoading: false, isValidating, isArchived: project?.archived })
          } else {
            return (project && isOfType<Jira.Project>(project, 'name')) ? (
              <Paragraph truncate={ truncate } margin={ inline ? '0 0 0 4px' : '0 0 0 8px' } display='inline-block'>
                { href ? (
                  <Link href={ href }>{ project.name }</Link>
                ) : (
                  <span>{ project.name }</span>
                )}
                { project.archived && <span style={{ margin: '0 0 0 8px', display: 'inline-block' }}>(archived)</span>}
              </Paragraph>
            ) : (
              <Paragraph truncate={ truncate } inline>Project not found or access denied</Paragraph>
            );
          }
        } else {
          return '';
        }
      })()}
    </Column>
  </Wrapper>
);

export const ProjectWithAvatar = ({ project, projectId, inline, truncate, isValidating, isDisabled, href, size, shouldFitContainer, component, onError, ...rest }: ProjectWithAvatarProps & GridProps): JSX.Element => {
  if (project) {
    return component
      ? component({ project, isLoading: false, isValidating, isArchived: project.archived })
      : Content({ project, href, size, inline, truncate, isValidating, isDisabled, loading: false, shouldFitContainer, ...rest });
  } else if (typeof projectId !== 'undefined') {
    return (
      <JiraProviders.Project projectIdOrKey={ projectId } loadingMessage={ <Spinner size='medium' /> }>
        { ({ project: currentProject, loading }) => {
          return component
            ? component({ project: currentProject, isLoading: loading, isValidating, isArchived: currentProject?.archived })
            : Content({ project: currentProject, href, size, inline, truncate, isValidating, isDisabled, loading, shouldFitContainer, ...rest })
        }}
      </JiraProviders.Project>
    );
  } else {
    onError && onError();
    return <></>;
  }
};