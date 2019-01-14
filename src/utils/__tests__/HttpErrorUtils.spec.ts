import { HttpClientRequestConfig } from "../../interfaces/HttpClientRequestConfig";
import { HttpClientResponse } from "../../interfaces/HttpClientResponse";
import { HttpStatus } from "../..";
import {
  HTTP_ERROR_TIMEOUT_CODE,
  createHttpClientError,
  getHttpClientErrorStatus,
  isHttpClientError,
  isHttpClientResponseError,
  isHttpClientTimeoutError,
} from "../HttpErrorUtils";

function mockConfig(): HttpClientRequestConfig {
  return { url: "/baz", method: "GET" };
}

function mockResponse(): HttpClientResponse {
  return { data: { message: "Foo" }, headers: {}, status: 400 };
}

describe("HttpErrorUtils", () => {
  describe("createHttpClientError", () => {
    test("basics", () => {
      const config = mockConfig();
      const response = mockResponse();

      const error = createHttpClientError({
        config,
        response,
        code: "foo",
        message: "Bar",
      });

      expect(error).toBeInstanceOf(Error);
      expect(error.config).toBe(config);
      expect(error.response).toBe(response);
      expect(error.code).toBe("foo");
      expect(error.message).toBe("Bar");
    });
  });

  describe("isHttpClientError", () => {
    test("basics", () => {
      expect(isHttpClientError([])).toBe(false);
      expect(isHttpClientError(new Error("Foo"))).toBe(false);

      expect(
        isHttpClientError(
          createHttpClientError({
            message: "Foo",
            config: mockConfig(),
          }),
        ),
      ).toBe(true);
    });
  });

  describe("isHttpClientResponseError", () => {
    test("basics", () => {
      expect(isHttpClientResponseError([])).toBe(false);
      expect(isHttpClientResponseError(new Error("Foo"))).toBe(false);

      expect(
        isHttpClientResponseError(
          createHttpClientError({
            message: "Foo",
            config: mockConfig(),
          }),
        ),
      ).toBe(false);

      expect(
        isHttpClientResponseError(
          createHttpClientError({
            message: "Foo",
            config: mockConfig(),
            response: mockResponse(),
          }),
        ),
      ).toBe(true);
    });
  });

  describe("getHttpClientErrorStatus", () => {
    test("basics", () => {
      expect(getHttpClientErrorStatus([])).toBeUndefined();
      expect(getHttpClientErrorStatus(new Error("Foo"))).toBeUndefined();

      expect(
        getHttpClientErrorStatus(
          createHttpClientError({
            message: "Foo",
            config: mockConfig(),
          }),
        ),
      ).toBeUndefined();

      const response = mockResponse();

      expect(
        getHttpClientErrorStatus(
          createHttpClientError({
            response,
            message: "Foo",
            config: mockConfig(),
          }),
        ),
      ).toBe(response.status);
    });
  });

  describe("isHttpClientTimeoutError", () => {
    test("basics", () => {
      expect(isHttpClientTimeoutError([])).toBe(false);
      expect(isHttpClientTimeoutError(new Error("Foo"))).toBe(false);

      expect(
        isHttpClientTimeoutError(
          createHttpClientError({
            message: "Foo",
            config: mockConfig(),
          }),
        ),
      ).toBe(false);

      expect(
        isHttpClientTimeoutError(
          createHttpClientError({
            message: "Foo",
            config: mockConfig(),
            response: mockResponse(),
          }),
        ),
      ).toBe(false);

      expect(
        isHttpClientTimeoutError(
          createHttpClientError({
            code: HTTP_ERROR_TIMEOUT_CODE,

            message: "Foo",
            config: mockConfig(),
          }),
        ),
      ).toBe(true);

      expect(
        isHttpClientTimeoutError(
          createHttpClientError({
            message: "Foo",
            config: mockConfig(),
            response: {
              data: "",
              headers: {},
              status: HttpStatus.GatewayTimeout,
            },
          }),
        ),
      ).toBe(true);
    });
  });
});
