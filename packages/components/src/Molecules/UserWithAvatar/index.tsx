import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import React from 'react';

import { useACJS } from '../../Hooks';
import * as ConfluenceProviders from '../../Providers/confluence';
import * as JiraProviders from '../../Providers/jira';
import { EntityWithAvatar, EntityWithAvatarProps } from '../EntityWithAvatar';
import { IconWithLabel } from '../IconWithLabel';

export type UserWithAvatarProps = Omit<EntityWithAvatarProps<Jira.User|Confluence.User>, 'entity'> & {
  user?: Jira.User|Confluence.User|null,
  accountId?: string
};

export const UserWithAvatar = ({ user, accountId, ...props }: UserWithAvatarProps): JSX.Element => {
  const ACJS = useACJS();

  return user ? (
    <EntityWithAvatar {...props} entity={ user } isLoading={ false } />
  ) : typeof accountId !== 'undefined' ? (
      <>
        { isOfType<AP.JiraInstance>(ACJS, 'jira') ? (
          <JiraProviders.User accountId={ accountId } loadingMessage={ <Spinner size='medium' /> }>
            { ({ user: currentUser, loading }) => <EntityWithAvatar {...props} entity={ currentUser } isLoading={ loading }  /> }
          </JiraProviders.User>
        ) : isOfType<AP.ConfluenceInstance>(ACJS, 'confluence') ? (
          <ConfluenceProviders.User accountId={ accountId } loadingMessage={ <Spinner size='medium' /> }>
            { ({ user: currentUser, loading }) => <EntityWithAvatar {...props} entity={ currentUser } isLoading={ loading }  /> }
          </ConfluenceProviders.User>
        ) : (
          <EntityWithAvatar {...props} />
        )}
      </>
  ) : props.isLoading ? (
    <Spinner size='medium' />
  ) : (
    <IconWithLabel src={ <WarningIcon label='user account ID not provided' /> } margin='0 4px 0 0'>
      User account ID not provided
    </IconWithLabel>
  )
};