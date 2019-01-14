import axios, { AxiosRequestConfig } from "axios";
import { Observable } from "rxjs";

import { HttpClientRequestConfig } from "../../interfaces/HttpClientRequestConfig";
import { isHttpClientError } from "../..";
import { HttpClient } from "../HttpClient";

jest.mock("axios");

const mockConfig: HttpClientRequestConfig = {
  method: "GET",

  url: "/foo/:bar",
  pathParams: { bar: "baz" },
  queryParams: { foo: "bar" },

  data: { foo: "bar" },
  headers: { foo: "bar" },

  timeout: 1000,
};

describe("HttpClient#request", () => {
  it("returns observable", () => {
    const client = new HttpClient();

    expect(
      client.request({ url: mockConfig.url, method: mockConfig.method }),
    ).toBeInstanceOf(Observable);
  });

  it("creates new instance of axios client", () => {
    const spy = jest.spyOn(axios, "create");

    expect(spy).toBeCalledTimes(0);

    expect(() => new HttpClient()).not.toThrow();

    expect(spy).toBeCalledTimes(1);
  });

  it("calls 'axios.request'", async () => {
    const instance = axios.create();

    jest.spyOn(axios, "create").mockImplementationOnce(() => instance);

    const spy = jest.spyOn(instance, "request");

    const client = new HttpClient();

    await expect(
      client
        .request({ url: mockConfig.url, method: mockConfig.method })
        .toPromise(),
    ).resolves.toMatchInlineSnapshot(`
Object {
  "data": Object {
    "cancelToken": Object {},
    "data": undefined,
    "headers": Object {},
    "method": "GET",
    "params": Object {},
    "url": "/foo/:bar",
  },
  "headers": undefined,
  "status": undefined,
}
`);

    expect(spy).toBeCalledTimes(1);
  });

  it.each([["GET"], ["POST"], ["PUT"], ["PATCH"], ["DELETE"]])(
    "requests with method '%s'",
    async method => {
      const client = new HttpClient();

      await expect(
        client
          .request<AxiosRequestConfig>({
            method,
            url: mockConfig.url,
          })
          .toPromise()
          .then(x => x.data.method),
      ).resolves.toBe(method);
    },
  );

  it.each([["/foo"], ["/bar"], ["/baz"]])("requests '%s'", async url => {
    const client = new HttpClient();

    await expect(
      client
        .request<AxiosRequestConfig>({ url, method: mockConfig.method })
        .toPromise()
        .then(x => x.data.url),
    ).resolves.toBe(url);
  });

  it.each([
    ["/hello/:name", { name: "foo" }, "/hello/foo"],
    ["/hello/:name", { name: "bar" }, "/hello/bar"],
    ["/hello/:name", { name: "baz" }, "/hello/baz"],
  ])("requests '%s' with '%j' path params", async (url, pathParams, result) => {
    const client = new HttpClient();

    await expect(
      client
        .request<AxiosRequestConfig>({
          url,
          pathParams,
          method: mockConfig.method,
        })
        .toPromise()
        .then(x => x.data.url),
    ).resolves.toBe(result);
  });

  it.each([
    ["/hello", { name: "foo" }, "/hello?name=foo"],
    ["/hello", { name: "bar" }, "/hello?name=bar"],
    ["/hello", { name: "baz" }, "/hello?name=baz"],
  ])("requests '%s' with '%j' query params", async (url, queryParams) => {
    const client = new HttpClient();

    await expect(
      client
        .request<AxiosRequestConfig>({
          url,
          queryParams,
          method: mockConfig.method,
        })
        .toPromise()
        .then(x => x.data.params),
    ).resolves.toEqual(queryParams);
  });

  it.each([[{ name: "foo" }], [{ name: "bar" }], [{ name: "baz" }]])(
    "requests with '%j' data",
    async data => {
      const client = new HttpClient();

      await expect(
        client
          .request<AxiosRequestConfig>({
            data,
            url: "/",
            method: mockConfig.method,
          })
          .toPromise()
          .then(x => x.data.data),
      ).resolves.toEqual(data);
    },
  );

  it.each([[{ name: "foo" }], [{ name: "bar" }], [{ name: "baz" }]])(
    "requests with '%j' header",
    async headers => {
      const client = new HttpClient();

      await expect(
        client
          .request<AxiosRequestConfig>({
            headers,
            url: "/",
            method: mockConfig.method,
          })
          .toPromise()
          .then(x => x.data.headers),
      ).resolves.toEqual(headers);
    },
  );

  it.each([[-100], [0], [100]])("requests '%s' timeout", async timeout => {
    const client = new HttpClient();

    await expect(
      client
        .request<AxiosRequestConfig>({
          timeout,
          url: "/",
          method: mockConfig.method,
        })
        .toPromise()
        .then(x => x.data.timeout),
    ).resolves.toEqual(timeout);
  });

  it.each([[NaN], [Infinity], [undefined]])(
    "requests without timeout if it's value is '%s'",
    async timeout => {
      const client = new HttpClient();

      await expect(
        client
          .request<AxiosRequestConfig>({
            timeout,
            url: "/",
            method: mockConfig.method,
          })
          .toPromise()
          .then(x => x.data.timeout),
      ).resolves.toBeUndefined();
    },
  );

  it("cancels request on observable close", () => {
    const token = axios.CancelToken.source();
    const spy = jest.spyOn(token, "cancel");

    jest.spyOn(axios.CancelToken, "source").mockImplementationOnce(() => token);

    const client = new HttpClient();
    const request = client.request({
      url: "cancel",
      method: mockConfig.method,
    });

    const subscriber = request.subscribe();

    expect(spy).toBeCalledTimes(0);

    subscriber.unsubscribe();

    expect(spy).toBeCalledTimes(1);

    spy.mockRestore();
  });

  it("throws HttpClientError on http errors", async () => {
    const client = new HttpClient();
    const request = client
      .request({
        url: "error",
        method: mockConfig.method,
      })
      .toPromise();

    await expect(request).rejects.toMatchInlineSnapshot(
      `[HttpClientError: Http Error]`,
    );
    await expect(request.catch(e => isHttpClientError(e))).resolves.toBe(true);
  });

  it("throws Error on sync errors", async () => {
    const client = new HttpClient();
    const request = client
      .request({
        url: "/foo/:bar",
        pathParams: {},
        method: mockConfig.method,
      })
      .toPromise();

    await expect(request).rejects.toMatchInlineSnapshot(
      `[TypeError: Expected "bar" to be a string]`,
    );
    await expect(request.catch(e => isHttpClientError(e))).resolves.toBe(false);
  });

  it("calls 'requestInterceptor' before request", async () => {
    const requestInterceptor = jest.fn();

    const options = { url: mockConfig.url, method: mockConfig.method };
    const client = new HttpClient({ requestInterceptor });
    const request = client.request(options);

    await request.toPromise();

    expect(requestInterceptor).toBeCalledTimes(1);
    expect(requestInterceptor).toBeCalledWith(options);
  });

  it("calls 'requestInterceptor' before request", async () => {
    const requestInterceptor = jest.fn();

    const config = {
      url: mockConfig.url,
      method: mockConfig.method,
    };
    const client = new HttpClient({ requestInterceptor });
    const request = client.request(config);

    await expect(request.toPromise()).resolves.toBeTruthy();

    expect(requestInterceptor).toBeCalledTimes(1);
    expect(requestInterceptor).toBeCalledWith(expect.objectContaining(config));
  });

  it("calls 'responseInterceptor' before request", async () => {
    const responseInterceptor = jest.fn();

    const config = {
      url: mockConfig.url,
      method: mockConfig.method,
    };
    const client = new HttpClient({ responseInterceptor });
    const request = client.request(config);

    const response = await request.toPromise();

    expect(responseInterceptor).toBeCalledTimes(1);
    expect(responseInterceptor).toBeCalledWith(
      expect.objectContaining(config),
      response,
    );
  });

  it("calls 'errorInterceptor' on errors", async () => {
    const errorInterceptor = jest.fn();

    const client = new HttpClient({ errorInterceptor });
    const request = client
      .request({
        url: "error",
        method: mockConfig.method,
      })
      .toPromise();

    await expect(request).rejects.toMatchInlineSnapshot(
      `[HttpClientError: Http Error]`,
    );

    const error = await request.catch(e => e);

    expect(errorInterceptor).lastCalledWith(error);
    expect(errorInterceptor).toBeCalledTimes(1);
  });

  it("calls 'shouldRetry' on errors", async () => {
    const shouldRetry = jest.fn(({ attempt }) => attempt < 3);

    const client = new HttpClient({ shouldRetry });
    const request = client
      .request({
        url: "error",
        method: mockConfig.method,
      })
      .toPromise();

    await expect(request).rejects.toMatchInlineSnapshot(
      `[HttpClientError: Http Error]`,
    );

    const error = await request.catch(e => e);

    expect(shouldRetry).toBeCalledTimes(3);
    expect(shouldRetry.mock.calls).toEqual([
      [{ error, attempt: 1, config: error.config }],
      [{ error, attempt: 2, config: error.config }],
      [{ error, attempt: 3, config: error.config }],
    ]);
  });
});

describe.each([
  [
    "get",
    {
      timeout: mockConfig.timeout,
      headers: mockConfig.headers,
      pathParams: mockConfig.pathParams,
      queryParams: mockConfig.queryParams,
    },
  ],
  [
    "post",
    {
      data: mockConfig.data,
      timeout: mockConfig.timeout,
      headers: mockConfig.headers,
      pathParams: mockConfig.pathParams,
      queryParams: mockConfig.queryParams,
    },
  ],
  [
    "put",
    {
      data: mockConfig.data,
      timeout: mockConfig.timeout,
      headers: mockConfig.headers,
      pathParams: mockConfig.pathParams,
      queryParams: mockConfig.queryParams,
    },
  ],
  [
    "patch",
    {
      data: mockConfig.data,
      timeout: mockConfig.timeout,
      headers: mockConfig.headers,
      pathParams: mockConfig.pathParams,
      queryParams: mockConfig.queryParams,
    },
  ],
  [
    "delete",
    {
      timeout: mockConfig.timeout,
      headers: mockConfig.headers,
      pathParams: mockConfig.pathParams,
      queryParams: mockConfig.queryParams,
    },
  ],
])("HttpClient#%s", (method: "get", options) => {
  it("calls HttpClient#request", () => {
    const client = new HttpClient();
    const spy = jest.spyOn(client, "request");

    expect(client[method](mockConfig.url, options)).toBeInstanceOf(Observable);

    expect(spy).toBeCalledTimes(1);

    expect(spy.mock.calls[0][0]).toEqual({
      ...options,
      url: mockConfig.url,
      method: method.toUpperCase(),
    });
  });
});
