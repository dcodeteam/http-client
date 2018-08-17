import { HttpClientRequestMethod } from "./HttpClientRequestMethod";

export interface HttpClientRequestConfig {
  readonly method: HttpClientRequestMethod;

  readonly url: string;
  readonly pathParams?: object;
  readonly queryParams?: object;

  readonly data?: object;
  readonly headers?: object;

  readonly timeout?: number;
}
