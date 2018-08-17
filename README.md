# HttpClient

[![npm version](https://img.shields.io/npm/v/@dc0de/http-client.svg)](https://npmjs.com/@dc0de/http-client)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/@dc0de/http-client.svg)](https://npmjs.com/@dc0de/http-client)
[![npm type definitions](https://img.shields.io/npm/types/@dc0de/http-client.svg)](https://npmjs.com/@dc0de/http-client)
[![npm downloads](https://img.shields.io/npm/dm/@dc0de/http-client.svg)](https://npmjs.com/@dc0de/http-client)
[![Build Status](https://travis-ci.com/dcodeteam/http-client.svg?branch=master)](https://travis-ci.com/dcodeteam/http-client)
[![codecov](https://codecov.io/gh/dcodeteam/http-client/branch/master/graph/badge.svg)](https://codecov.io/gh/dcodeteam/http-client)

We love `axios`! It has simple api and consistently works in `web`, `node` and `react-native`.

Also we love to use it with `rxjs`, it helps to add simple retry functionality, control http pool and prevent unwanted memory leaks.

But also we like to use "path patterns" (e.g: `/user/:userId/order/:orderId`) for api calls.

And ofcourse we wan't to know what kind of errors we have in our responses.

We want these features in every project!

### Installation

```bash
yarn add rxjs @dc0de/http-client
```

#### Usage

```javascript
import {
  HttpClient,
  HttpStatus,
  isHttpClientError,
  getHttpClientErrorStatus,
  isHttpClientTimeoutError
} from "@dc0de/http-client";

export function createHttpClient(logger, getToken, unauthorize) {
  return new HttpClient({
    requestInterceptor(config) {
      const token = getToken();

      config.headers = {
        ...config.headers,
        Accept: "application/json",
        "Content-Type": "application/json"
      };

      // Set authorization header.
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Set default timeout if it wasn't defined.
      if (config.timeout == null) {
        config.timeout = config.method === "GET" ? 10 * 1000 : 30 * 1000;
      }

      logger.logRequest(config);
    },

    responseInterceptor(config, response) {
      logger.logResponse(config, response);
    },

    errorInterceptor(error) {
      if (getHttpClientErrorStatus(error) === HttpStatus.Unauthorized) {
        unauthorize();
      }

      logger.logError(error);
    },

    shouldRetry({ attempt, error, config }) {
      // Do not retry `GET` requests.
      if (config.method !== "GET") {
        return false;
      }

      // Do not retry if it's not a HttpClientError.
      if (!isHttpClientError(error)) {
        // It may be sync error thrown during config composition.
        return false;
      }

      // Stop if there was 3 attempts.
      if (attempt > 3) {
        return false;
      }

      // Retry if it's timeout error.
      if (isHttpClientTimeoutError(error)) {
        return true;
      }

      // Retry if it was some server error.
      if (getHttpClientErrorStatus(error) >= 500) {
        return true;
      }

      return false;
    }
  });
}
```
