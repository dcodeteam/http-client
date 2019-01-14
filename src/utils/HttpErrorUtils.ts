import { HttpStatus } from "../http-status/HttpStatus";
import { HttpClientError } from "../interfaces/HttpClientError";
import { HttpClientRequestConfig } from "../interfaces/HttpClientRequestConfig";
import { HttpClientResponse } from "../interfaces/HttpClientResponse";

export const HTTP_ERROR_TIMEOUT_CODE = "ECONNABORTED";

export function createHttpClientError(options: {
  code?: string;
  message: string;
  response?: HttpClientResponse;
  config: HttpClientRequestConfig;
}): HttpClientError {
  return Object.assign(new Error(options.message), {
    framesToPop: 1,
    name: "HttpClientError",

    code: options.code,
    config: options.config,
    response: options.response,
  });
}

export function isHttpClientError(error: object): error is HttpClientError {
  return error != null && error instanceof Error && "config" in error;
}

export function getHttpClientErrorStatus(error: object): number | undefined {
  if (isHttpClientError(error)) {
    return error.response && error.response.status;
  }
}

export function isHttpClientResponseError(
  error: object,
): error is HttpClientError {
  return isHttpClientError(error) && error.response != null;
}

export function isHttpClientTimeoutError(
  error: object,
): error is HttpClientError {
  return (
    isHttpClientError(error) &&
    (error.code === HTTP_ERROR_TIMEOUT_CODE ||
      getHttpClientErrorStatus(error) === HttpStatus.GatewayTimeout)
  );
}
