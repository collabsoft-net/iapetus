import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import React from 'react';
import styled from 'styled-components';

import { Column, Grid, GridProps, Link, Paragraph, Row, withProps } from '../../Atoms/';
import { ConfluenceProviders } from '../../index';

const Wrapper = withProps<{ inline?: boolean }>()(styled(Grid))`
  display: ${props => props.inline ? 'inline-flex' : 'flex'};
  align-items: ${props => props.inline ? 'baseline' : 'center'};
`;

const AvatarWrapper = styled(Row)`
  display: inline-block;
  line-height: 0;
  align-self: center;
`;

export type SpaceWithAvatarProps = {
  size?: SizeType;
  isValidating?: boolean;
  isDisabled?: boolean;
  space?: Confluence.Space|Confluence.SpaceV2;
  spaceId?: number|string|PromiseLike<string|number>;
  inline?: boolean
  shouldFitContainer?: boolean;
  truncate?: boolean;
  href?: string;
  component?: (state: SpaceWithAvatarState) => JSX.Element;
  components?: {
    Avatar?: (state: SpaceWithAvatarState) => JSX.Element;
    Name?: (state: SpaceWithAvatarState) => JSX.Element;
  }
  onError?: () => void;
};

interface SpaceWithAvatarState {
  space?: Confluence.Space|Confluence.SpaceV2|null;
  isLoading: boolean;
  isValidating?: boolean;
  isArchived?: boolean;
}

const Content = ({ space, size, href, inline, truncate, isValidating, isDisabled, loading, components, shouldFitContainer, ...rest }: Omit<SpaceWithAvatarProps, 'spaceId'|'component'|'onError'> & GridProps & { loading?: boolean }) => (
  <Wrapper stretched={ shouldFitContainer } fluid inline={inline} vertical {...rest}>
    <AvatarWrapper>
      {(() => {
        if (loading || isValidating) {
          return <Spinner size='medium' />;
        } else if (components?.Avatar) {
          return components.Avatar({ space, isLoading: false, isValidating, isArchived: space?.status === 'archived' })
        } else if (!space || !isOfType<Confluence.Space|Confluence.SpaceV2>(space, 'icon')) {
          return <WarningIcon label='Space not found' />;
        } else {
          return <Avatar appearance='square' src={ space.icon?.path } size={ size || 'xsmall' } isDisabled={ isDisabled || space?.status === 'archived' } />;
        }
      })()}
    </AvatarWrapper>
    <Column stretched={ shouldFitContainer }>
      {(() => {
        if (!loading && !isValidating) {
          if (components?.Name) {
            return components.Name({ space, isLoading: false, isValidating, isArchived: space?.status === 'archived' })
          } else {
            return (space && isOfType<Confluence.Space|Confluence.SpaceV2>(space, 'name')) ? (
              <Paragraph truncate={ truncate } margin={ inline ? '0 0 0 4px' : '0 0 0 8px' } display={ inline ? 'inline-block' : undefined }>
                { href ? (
                  <Link href={ href }>{ space.name }</Link>
                ) : (
                  <span>{ space.name }</span>
                )}
                { space.status === 'archived' && <span style={{ margin: '0 0 0 8px', display: 'inline-block' }}>(archived)</span>}
              </Paragraph>
            ) : (
              <Paragraph truncate={ truncate } inline>Space not found or access denied</Paragraph>
            );
          }
        } else {
          return '';
        }
      })()}
    </Column>
  </Wrapper>
);

export const SpaceWithAvatar = ({ space, spaceId, inline, truncate, isValidating, isDisabled, href, size, shouldFitContainer, component, onError, ...rest }: SpaceWithAvatarProps & GridProps): JSX.Element => {
  if (space) {
    return component
      ? component({ space, isLoading: false, isValidating, isArchived: space.status === 'archived' })
      : Content({ space, href, size, inline, truncate, isValidating, isDisabled, loading: false, shouldFitContainer, ...rest });
  } else if (typeof spaceId !== 'undefined') {
    return (
      <ConfluenceProviders.Space spaceIdOrKey={ spaceId } options={{ includeIcon: true }} loadingMessage={ <Spinner size='medium' /> }>
        { ({ space: currentSpace, loading }) => {
          return component
            ? component({ space: currentSpace, isLoading: loading, isValidating, isArchived: currentSpace?.status === 'archived' })
            : Content({ space: currentSpace, href, size, inline, truncate, isValidating, isDisabled, loading, shouldFitContainer, ...rest })
        }}
      </ConfluenceProviders.Space>
    );
  } else {
    onError && onError();
    return <></>;
  }
};