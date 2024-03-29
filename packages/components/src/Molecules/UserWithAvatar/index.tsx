import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import React, { useContext } from 'react';
import styled from 'styled-components';

import { Link, Paragraph } from '../../Atoms';
import { AP } from '../../Contexts';
import * as ConfluenceProviders from '../../Providers/confluence';
import * as JiraProviders from '../../Providers/jira';

const Wrapper = styled.div`
  display: ${(props: { inline?: boolean }) => props.inline ? 'inline-flex' : 'flex'};
  align-items: center;
`;

const AvatarWrapper = styled.div`
  display: inline-block;
  line-height: 0;
`;

export type UserWithAvatarProps = {
  size?: SizeType;
  isValidating?: boolean;
  isDisabled?: boolean;
  user?: Jira.User|Confluence.User|null;
  accountId?: string;
  inline?: boolean
  truncate?: boolean;
  href?: string;
  component?: (state: UserWithAvatarState) => JSX.Element;
  onError?: (error?: Error) => void;
};

interface UserWithAvatarState {
  user?: Jira.User|Confluence.User|null;
  isLoading: boolean;
  isValidating?: boolean;
}

const Content = ({ user, size, href, inline, truncate, isValidating, isDisabled, loading }: Omit<UserWithAvatarProps, 'accountId'|'component'|'onError'> & { loading?: boolean }) => (
  <Wrapper inline={inline}>
    <AvatarWrapper>
      {(() => {
        if (loading || isValidating) {
          return <Spinner size='medium' />;
        } else if (!user || !isOfType<Jira.User|Confluence.User>(user, 'displayName')) {
          return <WarningIcon label='User not found' />;
        } else if (isOfType<Jira.User>(user, 'avatarUrls')) {
          return <Avatar src={ user.avatarUrls['32x32'] } size={ size || 'xsmall' } isDisabled={ isDisabled } />;
        } else if (isOfType<Confluence.User>(user, 'profilePicture')) {
          return <Avatar src={ user.profilePicture } size={ size || 'xsmall' } isDisabled={ isDisabled } />;
        } else {
          return <Avatar size={ size || 'xsmall' } isDisabled={ isDisabled } />;
        }
      })()}
    </AvatarWrapper>
    {(() => {
      if (!loading && !isValidating) {
        return (user && isOfType<Jira.User|Confluence.User>(user, 'displayName')) ? (
          <Paragraph truncate={ truncate } margin={ inline ? '0 0 0 4px' : '0 0 0 8px' } display='inline-block'>
            { href ? (
              <Link href={ href }>{ user.displayName }</Link>
            ) : (
              <span>{ user.displayName }</span>
            )}
          </Paragraph>
        ) : (
          <Paragraph truncate={ truncate } inline>User not found or access denied</Paragraph>
        );
      } else {
        return '';
      }
    })()}
  </Wrapper>
);

export const UserWithAvatar = ({ user, accountId, inline, truncate, isValidating, isDisabled, href, size, component, onError }: UserWithAvatarProps): JSX.Element => {

  const instance = useContext(AP);

  if (!instance) {
    onError && onError(new Error('Failed to retrieve instance of AP, please make sure the AP context is inititalized'));
    return <></>;
  }

  if (user) {
    return component
      ? component({ user, isLoading: false, isValidating })
      : Content({ user, href, size, inline, truncate, isValidating, isDisabled, loading: false });
  } else if (typeof accountId !== 'undefined') {
    return (
      <>
        { isOfType<AP.Instance>(instance, 'jira') ? (
          <JiraProviders.User accountId={ accountId } loadingMessage={ <Spinner size='medium' /> }>
            { ({ user: currentUser, loading }) => {
              return component
                ? component({ user: currentUser, isLoading: loading, isValidating })
                : Content({ user: currentUser, href, size, inline, truncate, isValidating, isDisabled, loading })
            }}
          </JiraProviders.User>
        ) : isOfType<AP.Instance>(instance, 'confluence') ? (
          <ConfluenceProviders.User accountId={ accountId } loadingMessage={ <Spinner size='medium' /> }>
            { ({ user: currentUser, loading }) => {
              return component
                ? component({ user: currentUser, isLoading: loading, isValidating })
                : Content({ user: currentUser, href, size, inline, truncate, isValidating, isDisabled, loading })
            }}
          </ConfluenceProviders.User>
        ) : (
          <Content />
        )}
      </>
    );
  } else {
    onError && onError(new Error('Failed to load user: neither "user" property nor "accountId" property has been set.'));
    return <></>;
  }
};