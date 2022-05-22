import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import kernel from '@collabsoft-net/inversify';
import { ConfluenceClientService } from '@collabsoft-net/services';
import { JiraClientService } from '@collabsoft-net/services';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Link, Paragraph } from '../../Atoms';

let service: JiraClientService|ConfluenceClientService;

kernel.onReady(() => {
  if (kernel.isBound(JiraClientService.getIdentifier())) {
    service = kernel.get<JiraClientService>(JiraClientService.getIdentifier());
  } else if (kernel.isBound(ConfluenceClientService.getIdentifier())) {
    service = kernel.get<ConfluenceClientService>(ConfluenceClientService.getIdentifier());
  } else {
    throw new Error(`Could not find instance of JiraClientService or ConfluenceClientService. Please make sure to bind it in your Inversify configuration using "JiraClientService.getIdentifier()" or "ConfluenceClientService.getIdentifier()"`);
  }
});

const Wrapper = styled.div`
  display: ${(props: { inline?: boolean }) => props.inline ? 'inline-flex' : 'flex'};
  align-items: center;
`;

const AvatarWrapper = styled.div`
  display: inline-block;
  line-height: 0;
`;

export type UserWithAvatarProps = {
  accountId?: string;
  size?: SizeType;
  isDisabled?: boolean;
  inline?: boolean
  href?: string;
  component?: (state: UserWithAvatarState) => JSX.Element;
  onError?: () => void;
};

interface UserWithAvatarState {
  user: Jira.User|Confluence.User|null;
  isLoading: boolean;
}

const memcache = new Map<number|string, Jira.User|Confluence.User>();

export const UserWithAvatar = ({ inline, accountId, isDisabled, href, size, component, onError }: UserWithAvatarProps): JSX.Element => {

  const [ user, setUser ] = useState<Jira.User|Confluence.User|null>(null);
  const [ name, setName ] = useState<string>();
  const [ avatar, setAvatar ] = useState<string>();
  const [ isLoading, setLoading ] = useState<boolean>(true);

  useEffect(() => {
    if (accountId) {
      if (memcache.has(accountId)) {
        const result = memcache.get(accountId) as Jira.User;
        setUser(result);
        setLoading(false);
      } else if (service) {
        service.getUser(accountId).then(setUser).finally(() => setLoading(false));
      }
    }
  }, [ accountId, service ]);

  useEffect(() => {
    if (!isLoading) {
      if (accountId && user) {
        memcache.set(accountId, user);
        if (isOfType<Jira.User>(user, 'avatarUrls')) {
          setName(user.name || user.displayName);
          setAvatar(user.avatarUrls['32x32']);
        } else {
          setName(user.displayName || user.publicName || user.username);
          setAvatar(user.profilePicture);
        }
      } else {
        onError && onError();
      }
    }
  }, [ accountId, user ]);


  return component ? component({ user, isLoading }) : (
    <Wrapper inline={inline}>
      <AvatarWrapper>
        {(() => {
          if (isLoading) {
            return <Spinner size='medium' />;
          } else if (!user) {
            return <WarningIcon label='User not found' />;
          } else {
            return <Avatar appearance='square' src={ avatar } size={ size || 'xsmall' } isDisabled={ isDisabled } />;
          }
        })()}
      </AvatarWrapper>
      {(() => {
        if (!isLoading) {
          if (user) {
            return (
              <Paragraph margin='0 0 0 8px' display='inline-block'>
                { href ? (
                  <Link href={ href }>{ name }</Link>
                ) : (
                  <span>{ name }</span>
                )}
              </Paragraph>
            );
          } else {
            return 'User not found or access denied';
          }
        } else {
          return '';
        }
      })()}
    </Wrapper>
  );
};