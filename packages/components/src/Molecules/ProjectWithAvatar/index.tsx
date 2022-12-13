import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import React from 'react';
import styled from 'styled-components';

import { Link, Paragraph, withProps } from '../../Atoms/';
import { JiraProviders } from '../../index';

const Wrapper = withProps<{ inline?: boolean }>()(styled.div)`
  display: ${props => props.inline ? 'inline-flex' : 'flex'};
  align-items: ${props => props.inline ? 'baseline' : 'center'};
`;

const AvatarWrapper = styled.div`
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
  href?: string;
  component?: (state: ProjectWithAvatarState) => JSX.Element;
  onError?: () => void;
};

interface ProjectWithAvatarState {
  project?: Jira.Project|null;
  isLoading: boolean;
  isValidating?: boolean;
  isArchived?: boolean;
}

const Content = ({ project, size, href, inline, isValidating, isDisabled, loading }: Omit<ProjectWithAvatarProps, 'projectId'|'component'|'onError'> & { loading?: boolean }) => (
  <Wrapper inline={inline}>
    <AvatarWrapper>
      {(() => {
        if (loading || isValidating) {
          return <Spinner size='medium' />;
        } else if (!project || !isOfType<Jira.Project>(project, 'avatarUrls')) {
          return <WarningIcon label='Project not found' />;
        } else {
          return <Avatar appearance='square' src={ project.avatarUrls['32x32'] } size={ size || 'xsmall' } isDisabled={ isDisabled || project?.archived } />;
        }
      })()}
    </AvatarWrapper>
    {(() => {
      if (!loading && !isValidating) {
        if (project && isOfType<Jira.Project>(project, 'name')) {
          return (
            <>
              <Paragraph margin={ inline ? '0 0 0 4px' : '0 0 0 8px' } display='inline-block'>
                { href ? (
                  <Link href={ href }>{ project.name }</Link>
                ) : (
                  <span>{ project.name }</span>
                )}
              </Paragraph>
              { project.archived && <Paragraph margin='0 0 0 8px' display='inline-block'>(archived)</Paragraph>}
            </>
          );
        } else {
          return 'Project not found or access denied';
        }
      } else {
        return '';
      }
    })()}
  </Wrapper>
);

export const ProjectWithAvatar = ({ project, projectId, inline, isValidating, isDisabled, href, size, component, onError }: ProjectWithAvatarProps): JSX.Element => {
  if (project) {
    return component
      ? component({ project, isLoading: false, isValidating, isArchived: project.archived })
      : Content({ project, href, size, inline, isValidating, isDisabled, loading: false });
  } else if (typeof projectId !== 'undefined') {
    return (
      <JiraProviders.Project projectIdOrKey={ projectId } loadingMessage={ <Spinner size='medium' /> }>
        { ({ project: currentProject, loading }) => {
          return component
            ? component({ project: currentProject, isLoading: loading, isValidating, isArchived: currentProject?.archived })
            : Content({ project: currentProject, href, size, inline, isValidating, isDisabled, loading })
        }}
      </JiraProviders.Project>
    );
  } else {
    onError && onError();
    return <></>;
  }
};