import { HttpClientRequestMethod } from "./HttpClientRequestMethod";

// eslint-disable-next-line typescript/no-explicit-any
type AnyObject = { [key: string]: any };

export interface HttpClientRequestConfig {
  readonly method: HttpClientRequestMethod;

  readonly url: string;

  readonly pathParams?: AnyObject;

  readonly queryParams?: AnyObject;

  readonly data?: object;

  readonly headers?: AnyObject;

  readonly timeout?: number;
}
