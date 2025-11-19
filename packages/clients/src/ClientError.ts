import { isOfType } from '@collabsoft-net/helpers';
import { AxiosError, HttpStatusCode, isAxiosError } from 'axios';

export enum ClientErrors {
  // Errors related to Client configuration & connectivity
  CONNECTIVITY,
  CONFIGURATION,
  TIMEOUT,

  // Errors related to request/response
  UNAUTHORIZED,
  NOTFOUND,
  RATELIMITING,
  BADREQUEST,

  // Anything else
  OTHER
}

export class ClientError<T> extends AxiosError {

  public isClientError = true;
  public type: ClientErrors;
  public body?: T;

  constructor(cause: AxiosError) {
    super();
    Object.assign(this, cause);
    this.enhanceNetworkError();

    this.type = this.getType();
    this.status = cause.status || cause.response?.status;

    if (isOfType(cause.response?.data, 'status') && typeof cause.response.data.status === 'number') {
      this.status = this.status || cause.response.data.status;
    }

    if (typeof cause.response?.data !== 'undefined' && cause.response?.data !== null) {
      this.body = cause.response.data as T;
    }
  }

  private getType(): ClientErrors {
    switch (this.status) {
      case HttpStatusCode.Unauthorized:
        return ClientErrors.UNAUTHORIZED;
      case HttpStatusCode.NotFound:
        return ClientErrors.NOTFOUND;
      case HttpStatusCode.TooManyRequests:
        return ClientErrors.RATELIMITING;
      case HttpStatusCode.BadRequest:
        return ClientErrors.BADREQUEST;
    }

    this.enhanceNetworkError();

    switch (this.code) {
      case 'ERR_NO_INTERNET':
      case AxiosError.ECONNABORTED:
      case AxiosError.ERR_NETWORK:
      case AxiosError.ERR_CANCELED:
      case 'ERR_DNS_FAILURE':
      case 'ERR_CONNECTION_REFUSED':
      case 'ERR_CORS_BLOCKED':
        return ClientErrors.CONNECTIVITY;

      case AxiosError.ERR_DEPRECATED:
      case AxiosError.ERR_NOT_SUPPORT:
      case AxiosError.ERR_BAD_OPTION:
      case AxiosError.ERR_BAD_OPTION_VALUE:
      case AxiosError.ERR_FR_TOO_MANY_REDIRECTS:
      case AxiosError.ERR_INVALID_URL:
        return ClientErrors.CONFIGURATION;

      case AxiosError.ERR_BAD_REQUEST:
      case AxiosError.ERR_BAD_RESPONSE:
        return ClientErrors.BADREQUEST;

      case AxiosError.ETIMEDOUT:
      case 'ERR_TIMEOUT':
        return ClientErrors.TIMEOUT;
    }

    return ClientErrors.OTHER;
  }

  private enhanceNetworkError() {
    // when Offline (no internet)
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.code = 'ERR_NO_INTERNET';
      this.message = 'No internet connection detected. Please check your connection and try again.';
    }

    // when DNS failure occurs (invalid domain)
    else if (this.code === 'ENOTFOUND' || /dns/i.test(this.message)) {
      this.code = 'ERR_DNS_FAILURE';
      this.message = 'Unable to reach the requested domain. Please verify the URL or your network settings.';
    }

    // when Connection refused by server
    else if (this.code === 'ECONNREFUSED' || /refused/i.test(this.message)) {
      this.code = 'ERR_CONNECTION_REFUSED';
      this.message = 'Connection was refused by the server. It may be temporarily unavailable.';
    }

    // when Request timeout happens
    else if (this.code === 'ETIMEDOUT' || /timeout/i.test(this.message)) {
      this.code = 'ERR_TIMEOUT';
      this.message = 'The request took too long to respond. Please try again later.';
    }

    // when CORS restriction happens (for browser only)
    else if (/CORS/i.test(this.message)) {
      this.code = 'ERR_CORS_BLOCKED';
      this.message = 'The request was blocked due to cross-origin restrictions.';
    }
  }

  public static isClientError(error: unknown) {
    return isOfType<ClientError<unknown>>(error, 'isClientError');
  }

  public static fromError<T>(error: unknown): ClientError<T>|Error {
    return isAxiosError(error)
      ? new ClientError<T>(error)
      : error instanceof Error || (isOfType<Error>(error, 'name') && isOfType<Error>(error, 'message'))
          ? error as Error
          : new Error(String(error));
  }

}