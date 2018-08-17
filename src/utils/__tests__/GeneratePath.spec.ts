import { generatePath } from "../GeneratePath";

describe("GeneratePath", () => {
  describe("generatePath", () => {
    test("empty 'urlPattern'", () => {
      expect(generatePath("", undefined)).toBe("");
    });

    test("empty 'pathParams'", () => {
      expect(generatePath("/foo", undefined)).toBe("/foo");
    });

    test("composition", () => {
      expect(generatePath("/foo/:bar", { bar: "baz" })).toBe("/foo/baz");
      expect(generatePath("/foo/:bar", { bar: "quoz" })).toBe("/foo/quoz");
    });
  });
});
