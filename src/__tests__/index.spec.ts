import * as modules from "../index";

describe("index", () => {
  test("public api", () => {
    expect(modules).toMatchInlineSnapshot(`
Object {
  "HTTP_ERROR_TIMEOUT_CODE": "ECONNABORTED",
  "HttpClient": [Function],
  "HttpStatus": Object {
    "400": "BadRequest",
    "401": "Unauthorized",
    "402": "PaymentRequired",
    "403": "Forbidden",
    "404": "NotFound",
    "405": "MethodNotAllowed",
    "500": "InternalServerError",
    "501": "NotImplemented",
    "502": "BadGateway",
    "503": "ServiceUnavailable",
    "504": "GatewayTimeout",
    "505": "HttpVersionNotSupported",
    "506": "VariantAlsoNegotiates",
    "507": "InsufficientStorage",
    "508": "LoopDetected",
    "510": "NotExtended",
    "511": "NetworkAuthenticationRequired",
    "BadGateway": 502,
    "BadRequest": 400,
    "Forbidden": 403,
    "GatewayTimeout": 504,
    "HttpVersionNotSupported": 505,
    "InsufficientStorage": 507,
    "InternalServerError": 500,
    "LoopDetected": 508,
    "MethodNotAllowed": 405,
    "NetworkAuthenticationRequired": 511,
    "NotExtended": 510,
    "NotFound": 404,
    "NotImplemented": 501,
    "PaymentRequired": 402,
    "ServiceUnavailable": 503,
    "Unauthorized": 401,
    "VariantAlsoNegotiates": 506,
  },
  "createHttpClientError": [Function],
  "getHttpClientErrorStatus": [Function],
  "isHttpClientError": [Function],
  "isHttpClientResponseError": [Function],
  "isHttpClientTimeoutError": [Function],
}
`);
  });
});
