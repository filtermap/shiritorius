import * as functions from "./functions";

test("adds 1 + 2 to equal 3", (): void => {
  expect(functions.add(1, 2)).toBe(3);
});
