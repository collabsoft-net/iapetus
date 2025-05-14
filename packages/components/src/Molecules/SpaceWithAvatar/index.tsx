import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import React from 'react';

import { GridProps } from '../../Atoms/';
import { ConfluenceProviders, IconWithLabel } from '../../index';
import { EntityWithAvatar, EntityWithAvatarProps } from '../EntityWithAvatar';

export type SpaceWithAvatarProps = Omit<EntityWithAvatarProps<Confluence.Space|Confluence.SpaceV2>, 'entity'> & {
  space?: Confluence.Space|Confluence.SpaceV2|null;
  spaceIdOrKey?: string|number;
  onError?: (error?: Error) => void;
};

export const SpaceWithAvatar = ({ space, spaceIdOrKey, onError, ...props }: SpaceWithAvatarProps & GridProps): JSX.Element =>
  space ? (
    <EntityWithAvatar {...props} entity={ space } isLoading={ false } />
  ) : typeof spaceIdOrKey !== 'undefined' ? (
    <ConfluenceProviders.Space spaceIdOrKey={ spaceIdOrKey } options={{ includeIcon: true }} loadingMessage={ <Spinner size='medium' /> }>
      { ({ space: currentSpace, loading }) => <EntityWithAvatar {...props} entity={ currentSpace } isLoading={ loading } /> }
    </ConfluenceProviders.Space>
  ) : props.isLoading ? (
    <Spinner size='medium' />
  ) : (
    <IconWithLabel src={ <WarningIcon label='Space Key or ID not provided' /> } margin='0 4px 0 0'>
      Space Key or ID not provided
    </IconWithLabel>
  )
