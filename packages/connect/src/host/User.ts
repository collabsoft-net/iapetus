import { getMetaData } from '../helpers/getMetaData'
import { BadRequestError, Host } from '../Host';

export const UserCurrentUserEventHandler = (event: MessageEvent, AC: Host): void => {
  const userKey = getMetaData('user-key');
  if (!userKey) throw new BadRequestError();

  AC.reply(event, {
    atlassianAccountId: userKey,
    accountType: 'atlassian'
  });
}