import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import React from 'react';

import { GridProps } from '../../Atoms/';
import { IconWithLabel, JiraProviders } from '../../index';
import { EntityWithAvatar, EntityWithAvatarProps } from '../EntityWithAvatar';

export type projectWithAvatarProps = Omit<EntityWithAvatarProps<Jira.Project>, 'entity'> & {
  project?: Jira.Project|null;
  projectIdOrKey?: string|number;
  onError?: (error?: Error) => void;
};

export const projectWithAvatar = ({ project, projectIdOrKey, onError, ...props }: projectWithAvatarProps & GridProps): JSX.Element =>
  project ? (
    <EntityWithAvatar {...props} entity={ project } isLoading={ false } />
  ) : typeof projectIdOrKey !== 'undefined' ? (
    <JiraProviders.Project projectIdOrKey={ projectIdOrKey } loadingMessage={ <Spinner size='medium' /> }>
      { ({ project: currentproject, loading }) => <EntityWithAvatar {...props} entity={ currentproject } isLoading={ loading } /> }
    </JiraProviders.Project>
  ) : (
    <IconWithLabel src={ <WarningIcon label='Project Key or ID not provided' /> } margin='0 4px 0 0'>
      Project Key or ID not provided
    </IconWithLabel>
  )
