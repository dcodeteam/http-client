import axios, { AxiosRequestConfig } from "axios";
import { Observable } from "rxjs";

import { HttpClientRequestConfig } from "../../interfaces/HttpClientRequestConfig";
import { HttpClientRequestMethod } from "../../interfaces/HttpClientRequestMethod";
import { isHttpClientError } from "../..";
import { HttpClient } from "../HttpClient";

jest.mock("axios");

describe("HttpClient", () => {
  const mockConfig: HttpClientRequestConfig = {
    method: "GET",

    url: "/foo/:bar",
    pathParams: { bar: "baz" },
    queryParams: { foo: "bar" },

    data: { foo: "bar" },
    headers: { foo: "bar" },

    timeout: 1000,
  };

  const httpMethods: HttpClientRequestMethod[] = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
  ];

  describe("HttpClient#request", () => {
    it("should return observable", () => {
      const client = new HttpClient();

      expect(
        client.request({ url: mockConfig.url, method: mockConfig.method }),
      ).toBeInstanceOf(Observable);
    });

    it("should create new instance of axios client", () => {
      const spy = jest.spyOn(axios, "create");

      expect(spy).toHaveBeenCalledTimes(0);

      expect(() => new HttpClient()).not.toThrow();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call 'axios.request'", async () => {
      const instance = axios.create();

      jest.spyOn(axios, "create").mockImplementationOnce(() => instance);

      const spy = jest.spyOn(instance, "request");

      const client = new HttpClient();
      const request = client.request({
        url: mockConfig.url,
        method: mockConfig.method,
      });

      await expect(request.toPromise()).resolves.toMatchSnapshot();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should accept 'method'", async () => {
      const client = new HttpClient();

      await Promise.all(
        httpMethods.map(async method => {
          const request = client.request<AxiosRequestConfig>({
            method,
            url: mockConfig.url,
          });

          const response = await request.toPromise();

          expect(response.data.method).toBe(method);
        }),
      );
    });

    it("should accept 'url'", async () => {
      const client = new HttpClient();

      const urls = ["/foo", "/bar", "/baz"];

      await Promise.all(
        urls.map(async url => {
          const request = client.request<AxiosRequestConfig>({
            url,
            method: mockConfig.method,
          });

          const response = await request.toPromise();

          expect(response.data.url).toBe(url);
        }),
      );
    });

    it("should accept 'pathParams'", async () => {
      const client = new HttpClient();

      const pathParams = ["foo", "bar", "baz"];

      await Promise.all(
        pathParams.map(async param => {
          const request = client.request<AxiosRequestConfig>({
            url: "/hello/:name",
            method: mockConfig.method,
            pathParams: { name: param },
          });

          const response = await request.toPromise();

          expect(response.data.url).toBe(`/hello/${param}`);
        }),
      );
    });

    it("should clone 'queryParams'", async () => {
      const client = new HttpClient();

      const queryList = [{ foo: "bar" }, { foo: "baz" }, { foo: "quoz" }];

      await Promise.all(
        queryList.map(async queryParams => {
          const request = client.request<AxiosRequestConfig>({
            queryParams,
            url: mockConfig.url,
            method: mockConfig.method,
          });

          const response = await request.toPromise();

          expect(response.data.params).toEqual(queryParams);
          expect(response.data.params).not.toBe(queryParams);
        }),
      );
    });

    it("should accept 'data'", async () => {
      const client = new HttpClient();

      const dataList = [{}, {}, {}];

      await Promise.all(
        dataList.map(async data => {
          const request = client.request<AxiosRequestConfig>({
            data,
            url: mockConfig.url,
            method: mockConfig.method,
          });

          const response = await request.toPromise();

          expect(response.data.data).toBe(data);
        }),
      );
    });

    it("should clone 'headers'", async () => {
      const client = new HttpClient();

      const headerList = [{ foo: "bar" }, { foo: "baz" }, { foo: "quoz" }];

      await Promise.all(
        headerList.map(async headers => {
          const request = client.request<AxiosRequestConfig>({
            headers,
            url: mockConfig.url,
            method: mockConfig.method,
          });

          const response = await request.toPromise();

          expect(response.data.headers).toEqual(headers);
          expect(response.data.headers).not.toBe(headers);
        }),
      );
    });

    it("should accept 'timeout'", async () => {
      const client = new HttpClient();

      const timeouts = [-100, 0, 100];

      await Promise.all(
        timeouts.map(async timeout => {
          const request = client.request<AxiosRequestConfig>({
            timeout,
            url: mockConfig.url,
            method: mockConfig.method,
          });

          const response = await request.toPromise();

          expect(response.data.timeout).toBe(timeout);
        }),
      );
    });

    it("should unset 'timeout' if it is not finite", async () => {
      const client = new HttpClient();
      const invalidValues = [undefined, Infinity, NaN];

      await Promise.all(
        invalidValues.map(async timeout => {
          const request = client.request<AxiosRequestConfig>({
            timeout,
            url: mockConfig.url,
            method: mockConfig.method,
          });

          const response = await request.toPromise();

          expect(response.data.timeout).toBeUndefined();
        }),
      );
    });

    it("should cancel request on observable close", () => {
      const token = axios.CancelToken.source();
      const spy = jest.spyOn(token, "cancel");

      jest
        .spyOn(axios.CancelToken, "source")
        .mockImplementationOnce(() => token);

      const client = new HttpClient();
      const request = client.request({
        url: "cancel",
        method: mockConfig.method,
      });

      const subscriber = request.subscribe();

      expect(spy).toHaveBeenCalledTimes(0);

      subscriber.unsubscribe();

      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });

    it("should throw HttpClientError on http errors", async () => {
      const client = new HttpClient();
      const request = client.request({
        url: "error",
        method: mockConfig.method,
      });

      try {
        await request.toPromise();
      } catch (e) {
        expect(e).toMatchSnapshot();
        expect(isHttpClientError(e)).toBe(true);
      }

      expect.assertions(2);
    });

    it("should throw Error on sync errors", async () => {
      const client = new HttpClient();
      const request = client.request({
        url: "/foo/:bar",
        pathParams: {},
        method: mockConfig.method,
      });

      try {
        await request.toPromise();
      } catch (e) {
        expect(e).toMatchSnapshot();
        expect(e).toBeInstanceOf(Error);
        expect(isHttpClientError(e)).toBe(false);
      }

      expect.assertions(3);
    });

    it("should call 'requestInterceptor' before request", async () => {
      const requestInterceptor = jest.fn();

      const options = { url: mockConfig.url, method: mockConfig.method };
      const client = new HttpClient({ requestInterceptor });
      const request = client.request(options);

      await request.toPromise();

      expect(requestInterceptor).toHaveBeenCalledTimes(1);
      expect(requestInterceptor).toBeCalledWith(options);
    });

    it("should call 'requestInterceptor' before request", async () => {
      const requestInterceptor = jest.fn();

      const config = {
        url: mockConfig.url,
        method: mockConfig.method,
      };
      const client = new HttpClient({ requestInterceptor });
      const request = client.request(config);

      await expect(request.toPromise()).resolves.toBeTruthy();

      expect(requestInterceptor).toHaveBeenCalledTimes(1);
      expect(requestInterceptor).toBeCalledWith(
        expect.objectContaining(config),
      );
    });

    it("should call 'responseInterceptor' before request", async () => {
      const responseInterceptor = jest.fn();

      const config = {
        url: mockConfig.url,
        method: mockConfig.method,
      };
      const client = new HttpClient({ responseInterceptor });
      const request = client.request(config);

      const response = await request.toPromise();

      expect(responseInterceptor).toHaveBeenCalledTimes(1);
      expect(responseInterceptor).toBeCalledWith(
        expect.objectContaining(config),
        response,
      );
    });

    it("should call 'errorInterceptor' on errors", async () => {
      const errorInterceptor = jest.fn();

      const client = new HttpClient({ errorInterceptor });
      const request = client.request({
        url: "error",
        method: mockConfig.method,
      });

      try {
        await request.toPromise();
      } catch (e) {
        expect(e).toMatchSnapshot();
        expect(errorInterceptor).lastCalledWith(e);
        expect(errorInterceptor).toHaveBeenCalledTimes(1);
      }

      expect.assertions(3);
    });

    it("should call 'shouldRetry' on errors", async () => {
      const shouldRetry = jest.fn(({ attempt }) => attempt < 3);

      try {
        const client = new HttpClient({ shouldRetry });
        const request = client.request({
          url: "error",
          method: mockConfig.method,
        });

        await request.toPromise();
      } catch (e) {
        expect(e).toMatchSnapshot();
        expect(shouldRetry).toHaveBeenCalledTimes(3);
        expect(shouldRetry.mock.calls).toEqual([
          [{ error: e, attempt: 1, config: e.config }],
          [{ error: e, attempt: 2, config: e.config }],
          [{ error: e, attempt: 3, config: e.config }],
        ]);
      }

      expect.assertions(3);
    });
  });

  httpMethods.forEach(x => {
    const method = x.toLowerCase();

    describe(`HttpClient#${method}`, () => {
      it("should call HttpClient#request", () => {
        const client = new HttpClient();
        const spy = jest.spyOn(client, "request");

        if (x === "GET") {
          expect(
            client.get(mockConfig.url, {
              timeout: mockConfig.timeout,
              headers: mockConfig.headers,
              pathParams: mockConfig.pathParams,
              queryParams: mockConfig.queryParams,
            }),
          ).toBeInstanceOf(Observable);
        } else if (x === "POST") {
          expect(
            client.post(mockConfig.url, {
              data: mockConfig.data,
              timeout: mockConfig.timeout,
              headers: mockConfig.headers,
              pathParams: mockConfig.pathParams,
              queryParams: mockConfig.queryParams,
            }),
          ).toBeInstanceOf(Observable);
        } else if (x === "PUT") {
          expect(
            client.put(mockConfig.url, {
              data: mockConfig.data,
              timeout: mockConfig.timeout,
              headers: mockConfig.headers,
              pathParams: mockConfig.pathParams,
              queryParams: mockConfig.queryParams,
            }),
          ).toBeInstanceOf(Observable);
        } else if (x === "PATCH") {
          expect(
            client.patch(mockConfig.url, {
              data: mockConfig.data,
              timeout: mockConfig.timeout,
              headers: mockConfig.headers,
              pathParams: mockConfig.pathParams,
              queryParams: mockConfig.queryParams,
            }),
          ).toBeInstanceOf(Observable);
        } else if (x === "DELETE") {
          expect(
            client.delete(mockConfig.url, {
              timeout: mockConfig.timeout,
              headers: mockConfig.headers,
              pathParams: mockConfig.pathParams,
              queryParams: mockConfig.queryParams,
            }),
          ).toBeInstanceOf(Observable);
        }

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
