import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { ExtractResultType } from "../index";
import checkValidates from "../util/check-validates";

describe("jointz#constant", () => {
  it("allows only allowed values", () => {
    checkValidates(jointz.constant("def"), "def", []);
    checkValidates(jointz.constant("def"), "deff", [
      { message: 'must be one of "def"', path: [], value: "deff" },
    ]);
  });

  it("throws with invalid allowed values", () => {
    expect(() => jointz.constant({} as any)).to.throw();
    expect(() => jointz.constant([] as any)).to.throw();
  });

  it("allows null and undefined", () => {
    checkValidates(jointz.constant(null), null, []);
    checkValidates(jointz.constant(undefined), undefined, []);
    checkValidates(jointz.constant(null), undefined, [
      { message: "must be one of null", path: [], value: undefined },
    ]);
    checkValidates(jointz.constant(undefined), null, [
      { message: "must be one of undefined", path: [], value: null },
    ]);
  });

  it("throws with empty list", () => {
    expect(() => jointz.constant()).to.throw();
  });

  it("only works with allowed values", () => {
    checkValidates(jointz.constant("abc", "def"), "def", []);
    checkValidates(jointz.constant("abc", "def", 123, false), "abc", []);
    checkValidates(jointz.constant("abc", "def", 123, false), 123, []);
    checkValidates(jointz.constant("abc", "def", 123, false), false, []);
    checkValidates(jointz.constant("abc", "def", 0, false), 0, []);
    checkValidates(jointz.constant("abc", "def", 123, false), {}, [
      {
        message: 'must be one of "abc", "def", 123, false',
        path: [],
        value: {},
      },
    ]);
  });

  it("isValid typeguards properly", () => {
    const validator = jointz.constant("abc");
    const value: unknown = "abc";

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      expect(value.substring(0, 1)).to.eq("a");
    }
  });

  it("has the right type", () => {
    const validator = jointz.constant("abc", 123, null);

    assert<IsExact<ExtractResultType<typeof validator>, "abc" | 123 | null>>(
      true
    );
  });
});
