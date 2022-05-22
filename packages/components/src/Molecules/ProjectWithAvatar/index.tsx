import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import kernel from '@collabsoft-net/inversify';
import { JiraClientService } from '@collabsoft-net/services';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Link, Paragraph } from '../../Atoms/';

let service: JiraClientService;

kernel.onReady(() => {
  if (kernel.isBound(JiraClientService.getIdentifier())) {
    service = kernel.get<JiraClientService>(JiraClientService.getIdentifier());
  } else {
    throw new Error(`Could not find instance of JiraClientService, please make sure to bind it in your Inversify configuration using "JiraClientService.getIdentifier()"`);
  }
});

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
  projectId?: number|string;
  inline?: boolean
  href?: string;
  component?: (state: ProjectWithAvatarState) => JSX.Element;
  onError?: () => void;
};

interface ProjectWithAvatarState {
  project: Jira.Project|null;
  isLoading: boolean;
  isValidating?: boolean;
  isArchived: boolean;
}

const memcache = new Map<number|string, Jira.Project>();

export const ProjectWithAvatar = ({ projectId, inline, isValidating, isDisabled, href, size, component, onError }: ProjectWithAvatarProps): JSX.Element => {

  const [ project, setProject ] = useState<Jira.Project|null>(null);
  const [ isArchived, setArchived ] = useState<boolean>(false);
  const [ isLoading, setLoading ] = useState<boolean>(true);

  useEffect(() => {
    if (projectId) {
      if (memcache.has(projectId)) {
        const result = memcache.get(projectId) as Jira.Project;
        setProject(result);
        setLoading(false);
      } else if (service) {
        service.getProject(projectId).then(setProject).finally(() => setLoading(false));
      }
    }
  }, [ projectId, service ]);

  useEffect(() => {
    if (!isLoading) {
      if (projectId && project) {
        setArchived(project?.archived || false);
        memcache.set(projectId, project);
      } else {
        onError && onError();
      }
    }
  }, [ projectId, project ]);

  return component ? component({ project, isLoading, isValidating, isArchived }) : (
    <Wrapper inline={inline}>
      <AvatarWrapper>
        {(() => {
          if (isLoading || isValidating) {
            return <Spinner size='medium' />;
          } else if (!project) {
            return <WarningIcon label='Project not found' />;
          } else {
            return <Avatar appearance='square' src={ project.avatarUrls['32x32'] } size={ size || 'xsmall' } isDisabled={ isDisabled || isArchived } />;
          }
        })()}
      </AvatarWrapper>
      {(() => {
        if (!isLoading && !isValidating) {
          if (project) {
            return (
              <>
                <Paragraph margin='0 0 0 8px' display='inline-block'>
                  { href ? (
                    <Link href={ href }>{ project.name }</Link>
                  ) : (
                    <span>{ project.name }</span>
                  )}
                </Paragraph>
                { isArchived && <Paragraph margin='0 0 0 8px' display='inline-block'>(archived)</Paragraph>}
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
};