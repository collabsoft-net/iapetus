import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Link from '@atlaskit/link';
import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import styled from '@emotion/styled';
import React from 'react';

import { Column, Grid, GridProps, Paragraph, Row } from '../../Atoms/';

export interface EntityWithAvatarState<T extends Jira.Project|Jira.User|Confluence.Space|Confluence.SpaceV2|Confluence.User> {
  entity?: T|null,
  isLoading?: boolean;
}

export interface EntityWithAvatarProps<T extends Jira.Project|Jira.User|Confluence.Space|Confluence.SpaceV2|Confluence.User> {
  entity?: T|null,
  size?: SizeType
  inline?: boolean;
  truncate?: boolean;
  subtle?: boolean;
  shouldFitContainer?: boolean;
  href?: string;
  isLoading?: boolean
  isDisabled?: boolean;
  onClick?: () => void;
  components?: {
    Element?: (state: EntityWithAvatarState<T>) => JSX.Element;
    Avatar?: (state: EntityWithAvatarState<T>) => JSX.Element;
    Name?: (state: EntityWithAvatarState<T>) => JSX.Element;
  }
}

const Wrapper = styled(Grid)<{ inline?: boolean }>`
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

const getLabelFor = (entity: Jira.Project|Jira.User|Confluence.Space|Confluence.SpaceV2|Confluence.User) =>
  isOfType<Jira.User|Confluence.User>(entity, 'displayName')
    ? entity.displayName
    : entity.name;

const getAvatarSource = (entity: Jira.Project|Jira.User|Confluence.Space|Confluence.SpaceV2|Confluence.User): string|undefined => {
  if (isOfType<Jira.User|Jira.Project>(entity, 'avatarUrls')) {
    return entity.avatarUrls['32x32'];
  } else if (isOfType<Confluence.User>(entity, 'profilePicture')) {
    return entity.profilePicture;
  } else if (isOfType<Confluence.Space|Confluence.SpaceV2>(entity, 'icon')) {
    const baseUrl = isOfType<Confluence.SpaceV2>(entity, '_links') ? entity._links.base : '';
    return `${baseUrl.replace('/wiki', '')}${entity.icon?.path}`;
  } else {
    return undefined;
  }
}

export const EntityWithAvatar = <T extends Jira.Project|Jira.User|Confluence.Space|Confluence.SpaceV2|Confluence.User> ({ entity, size, inline, truncate, subtle, shouldFitContainer, href, isLoading, isDisabled, components, onClick, ...rest }: EntityWithAvatarProps<T> & GridProps): JSX.Element =>
  components?.Element ? (
    <components.Element entity={ entity } isLoading={ isLoading } />
  ) : (
    <Wrapper stretched={ shouldFitContainer } fluid inline={ inline } vertical {...rest} onClick={ onClick } cursor={ onClick ? 'pointer' : 'undefined' }>
      <AvatarWrapper>
        { (isLoading) ? (
          <Spinner size='medium' />
        ) : components?.Avatar ? (
          <components.Avatar entity={ entity } isLoading={ false } />
        ) : (!entity) ? (
          <WarningIcon label='Not found' />
        ) : (
          <Avatar appearance='square' src={ getAvatarSource(entity) } size={ size || 'xsmall' } isDisabled={ isDisabled } />
        )}
      </AvatarWrapper>
      <Column stretched={ shouldFitContainer }>
        { (isLoading) ? (
          <></>
        ) : !entity ? (
          <Paragraph truncate={ truncate } inline>Not found or access denied</Paragraph>
        ) : (components?.Name) ? (
          <components.Name entity={ entity } isLoading={ false } />
        ) : (
          <Paragraph truncate={ truncate } margin={ inline ? '0 0 0 4px' : '0 0 0 8px' } display={ inline ? 'inline-block' : undefined }>
            { onClick ? (
                <Link href='#' appearance={ subtle ? 'subtle' : 'default' } onClick={ (event: React.MouseEvent<HTMLAnchorElement>) => {
                  event.bubbles = false;
                  event.preventDefault();
                  event.stopPropagation();
                  onClick();
                }}>{ getLabelFor(entity) }</Link>
            ) : href ? (
              <Link appearance={ subtle ? 'subtle' : 'default' } href={ href } target="_blank">{ getLabelFor(entity) }</Link>
            ) : (
              <span>{ getLabelFor(entity) }</span>
            )}
            { (isOfType(entity, 'archived') && entity.archived) && <span style={{ margin: '0 0 0 8px', display: 'inline-block' }}>(archived)</span>}
          </Paragraph>
        )}
      </Column>
    </Wrapper>
  )
