import Spinner from '@atlaskit/spinner';
import React from 'react';

import { GridProps } from '../../Atoms/';
import { ConfluenceProviders } from '../../index';
import { EntityWithAvatar, EntityWithAvatarProps, EntityWithAvatarState } from '../EntityWithAvatar';

export type SpaceWithAvatarProps = Omit<EntityWithAvatarProps<Confluence.Space|Confluence.SpaceV2>, 'entity'|'components'> & {
  space?: Confluence.Space|Confluence.SpaceV2|null,
  spaceIdOrKey?: string,
  component?: (state: EntityWithAvatarState<Confluence.Space|Confluence.SpaceV2>) => JSX.Element;
  onError?: (error?: Error) => void;
};

export const SpaceWithAvatar = ({ space, spaceIdOrKey, component, onError, ...props }: SpaceWithAvatarProps & GridProps): JSX.Element => {
  if (space) {
    return component
      ? component({ entity: space, isLoading: false })
      : <EntityWithAvatar {...props} entity={ space } isLoading={ false } />
  } else if (typeof spaceIdOrKey !== 'undefined') {
    return (
      <ConfluenceProviders.Space spaceIdOrKey={ spaceIdOrKey } options={{ includeIcon: true }} loadingMessage={ <Spinner size='medium' /> }>
        { ({ space: currentSpace, loading }) => component
          ? component({ entity: currentSpace, isLoading: loading })
          : <EntityWithAvatar {...props} entity={ currentSpace } isLoading={ loading } />
        }
      </ConfluenceProviders.Space>
    );
  } else {
    if (onError) {
      onError();
    }
    return <></>;
  }
};