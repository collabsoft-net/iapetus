
import '@collabsoft-net/functions';

import { injectable } from 'inversify';
import { BaseHttpController, interfaces } from 'inversify-express-utils';

@injectable()
export class AbstractController extends BaseHttpController implements interfaces.Controller {

  protected get session(): Session {
    return this.httpContext.request.user as Session;
  }

}