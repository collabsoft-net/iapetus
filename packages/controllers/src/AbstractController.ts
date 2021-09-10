
import '@collabsoft-net/functions';

import { injectable } from 'inversify';
import { BaseHttpController, interfaces } from 'inversify-express-utils';

@injectable()
export class AbstractController<T extends Session> extends BaseHttpController implements interfaces.Controller {

  protected get session(): T {
    return this.httpContext.request.user as T;
  }

}