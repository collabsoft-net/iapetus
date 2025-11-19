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
  public cause: AxiosError;
  public body?: T;

  constructor(message: string);
  constructor(error: AxiosError);
  constructor(messageOrError: string|AxiosError) {
    super();

    if (typeof messageOrError === 'string') {
      this.message = messageOrError;
      this.cause = new AxiosError();
    } else {
      Object.assign(this, messageOrError);
      this.cause = messageOrError;
    }

    this.enhanceNetworkError();

    this.type = this.getType();
    this.status = this.cause.status || this.cause.response?.status;

    if (isOfType(this.cause.response?.data, 'status') && typeof this.cause.response.data.status === 'number') {
      this.status = this.status || this.cause.response.data.status;
    }

    if (typeof this.cause.response?.data !== 'undefined' && this.cause.response?.data !== null) {
      this.body = this.cause.response.data as T;
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

  public static fromError<T>(error: unknown): ClientError<T> {
    if (isAxiosError(error)) {
      return new ClientError<T>(error);
    } else {
      const result = isOfType<Error>(error, 'message') ? new AxiosError(error.message) : new AxiosError();
      result.cause = error;
      return new ClientError<T>(result);
    }
  }

}