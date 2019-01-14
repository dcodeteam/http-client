import { generatePath } from "../GeneratePath";

test.each([
  ["", undefined, "/"],
  [null, undefined, "/"],
  [undefined, undefined, "/"],

  ["/hello", null, "/hello"],
  ["/hello", undefined, "/hello"],

  ["/hello/:name", { name: "foo" }, "/hello/foo"],
  ["/hello/:name", { name: "bar" }, "/hello/bar"],
  ["/hello/:name", { name: "baz" }, "/hello/baz"],
])("generatePath(%j, %j): %j", (urlPattern, urlParams, result) => {
  expect(generatePath(urlPattern, urlParams)).toBe(result);
});
