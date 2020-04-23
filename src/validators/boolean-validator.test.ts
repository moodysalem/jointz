import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { ExtractResultType } from "../index";
import checkValidates from "../util/check-validates";

describe("jointz#boolean", () => {
  it("allows true or false", () => {
    checkValidates(jointz.boolean(), true);
    checkValidates(jointz.boolean(), false);
  });

  it("rejects other types", () => {
    checkValidates(jointz.boolean(), "def", [
      { message: "must be a boolean", path: [], value: "def" },
    ]);
    checkValidates(jointz.boolean(), {}, [
      { message: "must be a boolean", path: [], value: {} },
    ]);
    checkValidates(jointz.boolean(), 5, [
      { message: "must be a boolean", path: [], value: 5 },
    ]);
  });

  it("isValid typeguards properly", () => {
    const validator = jointz.boolean();
    const value: unknown = false;

    if (validator.isValid(value)) {
      expect(value.valueOf()).to.eq(false);
    }
  });

  it("has the right type", () => {
    const validator = jointz.boolean();
    assert<IsExact<ExtractResultType<typeof validator>, boolean>>(true);
  });
});
