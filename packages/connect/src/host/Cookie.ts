import Cookies from 'js-cookie';

import type { Message } from '../client/Types';
import { CookieEraseRequest, CookieReadRequest, CookieReadResponse, CookieSaveRequest } from '../client/Types';
import { BadRequestError } from '../Host';

export const CookieSaveEventHandler = (message: Message<CookieSaveRequest>) => {
  const { data } = message;
  if (!data) throw new BadRequestError();
  Cookies.set(data.name, data.value, { expires: data.expires });
}

export const CookieReadEventHandler = (message: Message<CookieReadRequest>): CookieReadResponse => {
  const { data } = message;
  if (!data) throw new BadRequestError();
  const value = Cookies.get(data.name);
  return { value };
}

export const CookieEraseEventHandler = (message: Message<CookieEraseRequest>) => {
  const { data } = message;
  if (!data) throw new BadRequestError();
  Cookies.remove(data.name);
}