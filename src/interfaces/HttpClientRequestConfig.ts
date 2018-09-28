import { HttpClientRequestMethod } from "./HttpClientRequestMethod";

// eslint-disable-next-line typescript/no-explicit-any
type AnyObject = { [key: string]: any };

export interface HttpClientFetchRequestConfig {
  readonly pathParams?: AnyObject;

  readonly queryParams?: AnyObject;

  readonly headers?: AnyObject;

  readonly timeout?: number;
}

export interface HttpClientUpdateRequestConfig
  extends HttpClientFetchRequestConfig {
  readonly data?: AnyObject;
}

export interface HttpClientRequestConfig extends HttpClientUpdateRequestConfig {
  readonly method: HttpClientRequestMethod;

  readonly url: string;
}
