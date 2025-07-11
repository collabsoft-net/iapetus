import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import { Applications } from '@collabsoft-net/enums';
import React from 'react';
import { usePlatformBridge } from 'src/Hooks';

import * as ConfluenceProviders from '../../Providers/confluence';
import * as JiraProviders from '../../Providers/jira';
import { EntityWithAvatar, EntityWithAvatarProps } from '../EntityWithAvatar';
import { IconWithLabel } from '../IconWithLabel';

export type UserWithAvatarProps = Omit<EntityWithAvatarProps<Jira.User|Confluence.User>, 'entity'> & {
  user?: Jira.User|Confluence.User|null,
  accountId?: string
};

export const UserWithAvatar = ({ user, accountId, ...props }: UserWithAvatarProps): JSX.Element => {
  const bridge = usePlatformBridge();

  return user ? (
    <EntityWithAvatar {...props} entity={ user } isLoading={ false } />
  ) : typeof accountId !== 'undefined' ? (
      <>
        { bridge.product === Applications.JIRA ? (
          <JiraProviders.User accountId={ accountId } loadingMessage={ <Spinner size='medium' /> }>
            { ({ user: currentUser, loading }) => <EntityWithAvatar {...props} entity={ currentUser } isLoading={ loading }  /> }
          </JiraProviders.User>
        ) : bridge.product === Applications.CONFLUENCE ? (
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