
import { injectable } from 'inversify';
import { BaseHttpController, interfaces } from 'inversify-express-utils';

@injectable()
export abstract class AbstractController<T extends Record<string, unknown>> extends BaseHttpController implements interfaces.Controller {

  protected get session(): T {
    return this.httpContext.request.user as T;
  }

}