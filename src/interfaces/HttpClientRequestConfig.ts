import { HttpClientRequestMethod } from "./HttpClientRequestMethod";

type FlatObject = { [key: string]: null | number | string | undefined };

export interface HttpClientRequestConfig {
  readonly method: HttpClientRequestMethod;

  readonly url: string;

  readonly pathParams?: FlatObject;

  readonly queryParams?: FlatObject;

  readonly data?: object;

  readonly headers?: FlatObject;

  readonly timeout?: number;
}
