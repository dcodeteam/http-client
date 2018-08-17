import * as modules from "../index";

describe("index", () => {
  test("public api", () => {
    expect(modules).toMatchSnapshot();
  });
});
