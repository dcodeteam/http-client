import { HttpStatus } from "../HttpStatus";

describe("HttpStatus", () => {
  test("public api", () => {
    expect(HttpStatus).toMatchSnapshot();
  });
});
