import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import React from 'react';
import styled from 'styled-components';

import { Link, Paragraph } from '../../Atoms/';
import { JiraProviders } from '../../index';

const Wrapper = styled.div`
  display: ${(props: { inline?: boolean }) => props.inline ? 'inline-flex' : 'flex'};
  align-items: center;
`;

const AvatarWrapper = styled.div`
  display: inline-block;
  line-height: 0;
`;

export type ProjectWithAvatarProps = {
  size?: SizeType;
  isValidating?: boolean;
  isDisabled?: boolean;
  project?: Jira.Project;
  projectId?: number|string;
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

export const ProjectWithAvatar = ({ project, projectId, inline, isValidating, isDisabled, href, size, component, onError }: ProjectWithAvatarProps): JSX.Element => {

  const Content = ({ project: currentProject, loading }: {
    project?: Jira.Project;
    loading: boolean;
  }) =>
    <Wrapper inline={inline}>
      <AvatarWrapper>
        {(() => {
          if (loading || isValidating) {
            return <Spinner size='medium' />;
          } else if (!project) {
            return <WarningIcon label='Project not found' />;
          } else {
            return <Avatar appearance='square' src={ project.avatarUrls['32x32'] } size={ size || 'xsmall' } isDisabled={ isDisabled || currentProject?.archived } />;
          }
        })()}
      </AvatarWrapper>
      {(() => {
        if (!loading && !isValidating) {
          if (currentProject) {
            return (
              <>
                <Paragraph margin='0 0 0 8px' display='inline-block'>
                  { href ? (
                    <Link href={ href }>{ currentProject.name }</Link>
                  ) : (
                    <span>{ currentProject.name }</span>
                  )}
                </Paragraph>
                { currentProject.archived && <Paragraph margin='0 0 0 8px' display='inline-block'>(archived)</Paragraph>}
              </>
            );
          } else {
            return 'Project not found or access denied';
          }
        } else {
          return '';
        }
      })()}
    </Wrapper>;

  if (project) {
    return component
      ? component({ project, isLoading: false, isValidating, isArchived: project.archived })
      : Content({ project, loading: false });
  } else if (projectId) {
    return (
      <JiraProviders.Project projectIdOrKey={ projectId } loadingMessage={ <Spinner size='medium' /> }>
        { ({ project: currentProject, loading }) => {
          return component
            ? component({ project: currentProject, isLoading: loading, isValidating, isArchived: currentProject?.archived })
            : Content({ project: currentProject, loading })
        }}
      </JiraProviders.Project>
    );
  } else {
    onError && onError();
    return <></>;
  }
};