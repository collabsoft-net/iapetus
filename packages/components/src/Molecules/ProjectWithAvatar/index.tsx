import Spinner from '@atlaskit/spinner';
import React from 'react';

import { GridProps } from '../../Atoms/';
import { JiraProviders } from '../../index';
import { EntityWithAvatar, EntityWithAvatarProps, EntityWithAvatarState } from '../EntityWithAvatar';

export type ProjectWithAvatarProps = Omit<EntityWithAvatarProps<Jira.Project>, 'entity'|'components'> & {
  project?: Jira.Project|null,
  projectKeyOrId?: string,
  component?: (state: EntityWithAvatarState<Jira.Project>) => JSX.Element;
  onError?: (error?: Error) => void;
};

export const ProjectWithAvatar = ({ project, projectKeyOrId, component, onError, ...props }: ProjectWithAvatarProps & GridProps): JSX.Element => {
  if (project) {
    return component
      ? component({ entity: project, isLoading: false })
      : <EntityWithAvatar {...props} entity={ project } isLoading={ false } />
  } else if (typeof projectKeyOrId !== 'undefined') {
    return (
      <JiraProviders.Project projectIdOrKey={ projectKeyOrId } loadingMessage={ <Spinner size='medium' /> }>
        { ({ project: currentProject, loading }) => component
          ? component({ entity: currentProject, isLoading: loading })
          : <EntityWithAvatar {...props} entity={ currentProject } isLoading={ loading } />
        }
      </JiraProviders.Project>
    );
  } else {
    if (onError) {
      onError();
    }
    return <></>;
  }
};