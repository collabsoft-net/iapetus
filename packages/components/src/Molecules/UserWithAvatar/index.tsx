import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import React, { useContext } from 'react';

import { AP } from '../../Contexts';
import * as ConfluenceProviders from '../../Providers/confluence';
import * as JiraProviders from '../../Providers/jira';
import { EntityWithAvatar, EntityWithAvatarProps, EntityWithAvatarState } from '../EntityWithAvatar';

export type UserWithAvatarProps = Omit<EntityWithAvatarProps<Jira.User|Confluence.User>, 'entity'|'components'> & {
  user?: Jira.User|Confluence.User|null,
  accountId?: string,
  component?: (state: EntityWithAvatarState<Jira.User|Confluence.User>) => JSX.Element;
  onError?: (error?: Error) => void;
};

export const UserWithAvatar = ({ user, accountId, component, onError, ...props }: UserWithAvatarProps): JSX.Element => {

  const instance = useContext(AP);

  if (!instance) {
    if (onError) {
      onError(new Error('Failed to retrieve instance of AP, please make sure the AP context is inititalized'));
    }
    return <></>;
  }

  if (user) {
    return component
      ? component({ entity: user, isLoading: false })
      : <EntityWithAvatar {...props} entity={ user } isLoading={ false } />
  } else if (typeof accountId !== 'undefined') {
    return (
      <>
        { isOfType<AP.JiraInstance>(instance, 'jira') ? (
          <JiraProviders.User accountId={ accountId } loadingMessage={ <Spinner size='medium' /> }>
            { ({ user: currentUser, loading }) => component
              ? component({ entity: currentUser, isLoading: loading })
              : <EntityWithAvatar {...props} entity={ currentUser } isLoading={ loading }  />
            }
          </JiraProviders.User>
        ) : isOfType<AP.ConfluenceInstance>(instance, 'confluence') ? (
          <ConfluenceProviders.User accountId={ accountId } loadingMessage={ <Spinner size='medium' /> }>
            { ({ user: currentUser, loading }) => component
              ? component({ entity: currentUser, isLoading: loading })
              : <EntityWithAvatar {...props} entity={ currentUser } isLoading={ loading }  />
            }
          </ConfluenceProviders.User>
        ) : (
          <EntityWithAvatar {...props} />
        )}
      </>
    );
  } else {
    if (onError) {
      onError(new Error('Failed to load user: neither "user" property nor "accountId" property has been set.'));
    }
    return <></>;
  }
};