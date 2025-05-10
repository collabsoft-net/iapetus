import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Link from '@atlaskit/link';
import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import React from 'react';
import styled from 'styled-components';

import { Column, Grid, GridProps, Paragraph, Row, withProps } from '../../Atoms/';

export interface EntityWithAvatarState<T extends Jira.Project|Jira.User|Confluence.Space|Confluence.SpaceV2|Confluence.User> {
  entity?: T|null,
  isLoading?: boolean;
}

export interface EntityWithAvatarProps<T extends Jira.Project|Jira.User|Confluence.Space|Confluence.SpaceV2|Confluence.User> {
  entity?: T|null,
  size?: SizeType
  inline?: boolean;
  truncate?: boolean;
  shouldFitContainer?: boolean;
  href?: string;
  isLoading?: boolean
  isDisabled?: boolean;
  onClick?: () => void;
  components?: {
    Avatar?: (state: EntityWithAvatarState<T>) => JSX.Element;
    Name?: (state: EntityWithAvatarState<T>) => JSX.Element;
  }
}

const Wrapper = withProps<{ inline?: boolean }>()(styled(Grid))`
  display: ${props => props.inline ? 'inline-flex' : 'flex'};
  display: ${props => props.inline ? 'inline-flex' : 'flex'};
  display: ${(props: { inline?: boolean }) => props.inline ? 'inline-flex' : 'flex'};
  align-items: ${props => props.inline ? 'baseline' : 'center'};
  align-items: ${props => props.inline ? 'baseline' : 'center'};
  align-items: center;
`;

const AvatarWrapper = styled(Row)`
  display: inline-block;
  line-height: 0;
  align-self: center;
`;

export const EntityWithAvatar = <T extends Jira.Project|Jira.User|Confluence.Space|Confluence.SpaceV2|Confluence.User> ({ entity, size, inline, truncate, shouldFitContainer, href, isLoading, isDisabled, components, onClick, ...rest }: EntityWithAvatarProps<T> & GridProps): JSX.Element => (
  <Wrapper stretched={ shouldFitContainer } fluid inline={ inline } vertical {...rest} onClick={ onClick } cursor={ onClick ? 'pointer' : 'undefined' }>
    <AvatarWrapper>
      {(() => {
        if (isLoading) {
          return <Spinner size='medium' />;
        } else if (components?.Avatar) {
          return components.Avatar({ entity, isLoading: false })
        } else if (!entity) {
          return <WarningIcon label='Not found' />;
        } else if (isOfType<Jira.User|Jira.Project>(entity, 'avatarUrls')) {
          return <Avatar appearance='square' src={ entity.avatarUrls['32x32'] } size={ size || 'xsmall' } isDisabled={ isDisabled } />;
        } else if (isOfType<Confluence.User>(entity, 'profilePicture')) {
          return <Avatar appearance='square' src={ entity.profilePicture } size={ size || 'xsmall' } isDisabled={ isDisabled } />;
        } else if (isOfType<Confluence.Space|Confluence.SpaceV2>(entity, 'icon')) {
          const baseUrl = isOfType<Confluence.SpaceV2>(entity, '_links') ? entity._links.base : '';
          const iconUrl = `${baseUrl.replace('/wiki', '')}${entity.icon?.path}`;
          return <Avatar appearance='square' src={ iconUrl } size={ size || 'xsmall' } isDisabled={ isDisabled } />;
        } else {
          return <Avatar appearance='square' size={ size || 'xsmall' } isDisabled={ isDisabled } />;
        }
      })()}
    </AvatarWrapper>
    <Column stretched={ shouldFitContainer }>
      {(() => {
        if (!isLoading) {
          if (entity) {
            if (components?.Name) {
              return components.Name({ entity, isLoading: false })
            } else {
              const label = isOfType<Jira.User|Confluence.User>(entity, 'displayName')
                ? entity.displayName
                : entity.name;

              return (
                <Paragraph truncate={ truncate } margin={ inline ? '0 0 0 4px' : '0 0 0 8px' } display={ inline ? 'inline-block' : undefined }>
                  { onClick ? (
                      <Link href='#' onClick={ (event: React.MouseEvent<HTMLAnchorElement>) => {
                        event.bubbles = false;
                        event.preventDefault();
                        event.stopPropagation();
                        onClick();
                      }}>{ label }</Link>
                  ) : href ? (
                    <Link href={ href } target="_blank">{ label }</Link>
                  ) : (
                    <span>{ label }</span>
                  )}
                  { (isOfType(entity, 'archived') && entity.archived) && <span style={{ margin: '0 0 0 8px', display: 'inline-block' }}>(archived)</span>}
                </Paragraph>
              )
            }
          } else {
            return <Paragraph truncate={ truncate } inline>Not found or access denied</Paragraph>
          }
        } else {
          return <></>;
        }
      })}
    </Column>
  </Wrapper>
)