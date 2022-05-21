import Avatar, { SizeType } from '@atlaskit/avatar';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';
import { isOfType } from '@collabsoft-net/helpers';
import kernel from '@collabsoft-net/inversify';
import { ConfluenceClientService } from '@collabsoft-net/services';
import { JiraClientService } from '@collabsoft-net/services';
import React, { useEffect, useState } from 'react';
import { Link } from 'src/Atoms';
import styled from 'styled-components';

import { Paragraph } from '../../Atoms/Typography';

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
  isDisabled?: boolean;
  accountId: string;
  inline?: boolean
  href?: string;
  component?: (state: UserWithAvatarState) => JSX.Element;
};

interface UserWithAvatarState {
  user: Jira.User|Confluence.User|null;
  isLoading: boolean;
}

const memcache = new Map<number|string, Jira.User|Confluence.User>();

export const UserWithAvatar = ({ inline, accountId, isDisabled, href, size, component }: UserWithAvatarProps): JSX.Element => {

  const [ service, setService ] = useState<JiraClientService|ConfluenceClientService>();
  const [ user, setUser ] = useState<Jira.User|Confluence.User|null>(null);
  const [ name, setName ] = useState<string>();
  const [ avatar, setAvatar ] = useState<string>();
  const [ isLoading, setLoading ] = useState<boolean>(true);

  kernel.onReady(() => {
    if (kernel.isBound(JiraClientService.getIdentifier())) {
      setService(kernel.get<JiraClientService>(JiraClientService.getIdentifier()));
    } else if (kernel.isBound(ConfluenceClientService.getIdentifier())) {
      setService(kernel.get<ConfluenceClientService>(ConfluenceClientService.getIdentifier()));
    }
  });

  useEffect(() => {
    if (memcache.has(accountId)) {
      const result = memcache.get(accountId) as Jira.User;
      setUser(result);
      setLoading(false);
    } else if (service) {
      service.getUser(accountId).then(setUser).finally(() => setLoading(false));
    }
  }, [ service ]);

  useEffect(() => {
    if (!isLoading && user) {
      memcache.set(accountId, user);
      if (isOfType<Jira.User>(user, 'avatarUrls')) {
        setName(user.name || user.displayName);
        setAvatar(user.avatarUrls['32x32']);
      } else {
        setName(user.displayName || user.publicName || user.username);
        setAvatar(user.profilePicture);
      }
    }
  }, [ user ]);


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