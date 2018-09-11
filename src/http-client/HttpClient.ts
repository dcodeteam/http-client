import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from "axios";
import { Observable, defer, throwError } from "rxjs";
import { catchError, map, retryWhen } from "rxjs/operators";

import { HttpClientError } from "../interfaces/HttpClientError";
import {
  HttpClientFetchRequestConfig,
  HttpClientRequestConfig,
  HttpClientUpdateRequestConfig
} from "../interfaces/HttpClientRequestConfig";
import { HttpClientResponse } from "../interfaces/HttpClientResponse";
import { generatePath } from "../utils/GeneratePath";
import { createHttpClientError } from "../utils/HttpErrorUtils";

function isAxiosError(error: Error): error is AxiosError {
  return "config" in error;
}

export interface HttpClientOptions {
  readonly shouldRetry?: (
    info: {
      attempt: number;
      error: Error | HttpClientError;
      config: HttpClientRequestConfig;
    }
  ) => void;

  readonly errorInterceptor?: (error: Error | HttpClientError) => void;
  readonly requestInterceptor?: (config: HttpClientRequestConfig) => void;
  readonly responseInterceptor?: (
    config: HttpClientRequestConfig,
    response: HttpClientResponse
  ) => void;
}

/**
##### Initialization

```javascript
export function createHttpClient(logger) {
  return new HttpClient({
    requestInterceptor(config) {
      logger.logRequest(config);
    },
 *
    responseInterceptor(config, response) {
      logger.logResponse(config, response);
    },
 *
    errorInterceptor(error) {
      logger.logError(error);
    },
  });
}
```

##### Request
```javascript
const USER_URL = "/user/:userId";
const USER_COMMENTS_URL = "/user/:userId/comments";

export function fetchUser(httpClient, userId) {
  return httpClient.get(USER_URL, {
    pathParams: { userId }
  });
}

export function fetchUserPosts(httpClient, userId, page, limit) {
  return httpClient.get(USER_COMMENTS_URL, {
    url: USER_URL,
    pathParams: { userId },
    queryParams: { page, limit }
  });
}
```
 */
export class HttpClient {
  private readonly client: AxiosInstance;

  private readonly options: HttpClientOptions;

  public constructor(options: HttpClientOptions = {}) {
    this.options = options;
    this.client = axios.create();
  }

  public get<T>(
    url: string,
    options?: HttpClientFetchRequestConfig
  ): Observable<HttpClientResponse<T>> {
    return this.request<T>({ ...options, url, method: "GET" });
  }

  public post<T>(
    url: string,
    options?: HttpClientUpdateRequestConfig
  ): Observable<HttpClientResponse<T>> {
    return this.request<T>({ ...options, url, method: "POST" });
  }

  public put<T>(
    url: string,
    options?: HttpClientUpdateRequestConfig
  ): Observable<HttpClientResponse<T>> {
    return this.request<T>({ ...options, url, method: "PUT" });
  }

  public patch<T>(
    url: string,
    options?: HttpClientUpdateRequestConfig
  ): Observable<HttpClientResponse<T>> {
    return this.request<T>({ ...options, url, method: "PATCH" });
  }

  public delete<T>(
    url: string,
    options?: HttpClientFetchRequestConfig
  ): Observable<HttpClientResponse<T>> {
    return this.request<T>({ ...options, url, method: "DELETE" });
  }

  public request<T>(
    options: HttpClientRequestConfig
  ): Observable<HttpClientResponse<T>> {
    return defer(() => {
      const cancelTokenSource = axios.CancelToken.source();

      const {
        shouldRetry,
        errorInterceptor,
        requestInterceptor,
        responseInterceptor
      } = this.options;

      if (requestInterceptor) {
        requestInterceptor(options);
      }

      let stream = new Observable<AxiosResponse<T>>(subscriber => {
        let complete = false;
        const config: AxiosRequestConfig = {
          method: options.method,

          url: generatePath(options.url, options.pathParams),
          params: { ...options.queryParams },

          data: options.data,

          headers: { ...options.headers },

          timeout: options.timeout,

          cancelToken: cancelTokenSource.token
        };

        // Fix for react-native in Android devices.
        if (config.timeout == null || !isFinite(config.timeout)) {
          delete config.timeout;
        }

        this.client
          .request<T>(config)
          .then(response => {
            subscriber.next(response);
          })
          .catch(error => {
            if (!axios.isCancel(error)) {
              subscriber.error(error);
            }
          })
          .then(() => {
            complete = true;
            subscriber.complete();
          });

        return () => {
          if (!complete) {
            cancelTokenSource.cancel();
          }
        };
      }).pipe(
        map(x => {
          const response: HttpClientResponse<T> = {
            data: x.data,
            status: x.status,
            headers: x.headers
          };

          if (responseInterceptor) {
            responseInterceptor(options, response);
          }

          return response;
        }),

        catchError((x: Error | AxiosError) => {
          const error = !isAxiosError(x)
            ? x
            : createHttpClientError({
                code: x.code,
                config: options,
                message: x.message,
                response: x.response
              });

          if (errorInterceptor) {
            errorInterceptor(error);
          }

          return throwError(error);
        })
      );

      if (shouldRetry) {
        stream = stream.pipe(
          retryWhen(errors =>
            errors.pipe(
              map((error, i) => {
                if (!shouldRetry({ error, config: options, attempt: i + 1 })) {
                  throw error;
                }

                return i;
              })
            )
          )
        );
      }

      return stream;
    });
  }
}
