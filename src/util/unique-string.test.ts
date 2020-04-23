import { expect } from "chai";
import uniqueString from "./unique-string";

describe("uniqueString", () => {
  it("removes duplicates", () => {
    expect(uniqueString(["abc", "def", "abc"])).to.deep.eq(["abc", "def"]);
  });

  it("empty array", () => {
    expect(uniqueString([])).to.deep.eq([]);
  });
});
