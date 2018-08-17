import { HttpClientRequestConfig } from "./HttpClientRequestConfig";
import { HttpClientResponse } from "./HttpClientResponse";

export interface HttpClientError extends Error {
  readonly code?: string;
  readonly response?: HttpClientResponse;
  readonly config: HttpClientRequestConfig;
}
