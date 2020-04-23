import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { ExtractResultType } from "../index";
import checkValidates from "../util/check-validates";

describe("jointz#number", () => {
  it("only allows numbers", () => {
    checkValidates(jointz.number(), "s", [
      { message: "must be a number", path: [], value: "s" },
    ]);
    checkValidates(jointz.number(), {}, [
      { message: "must be a number", path: [], value: {} },
    ]);
    checkValidates(jointz.number(), 1, []);
  });

  it("validates multipleOf", () => {
    checkValidates(jointz.number().multipleOf(1), 1, []);
    checkValidates(jointz.number().multipleOf(0.5), 1, []);
    checkValidates(jointz.number().integer(), 1, []);

    checkValidates(jointz.number().integer(), 0.5, [
      { message: "number was not an integer", path: [], value: 0.5 },
    ]);

    checkValidates(jointz.number().multipleOf(2), 3, [
      { message: "number was not a multiple of 2", path: [], value: 3 },
    ]);
  });

  it("validates min/max", () => {
    checkValidates(jointz.number().min(1), 1, []);
    checkValidates(jointz.number().max(1), 1, []);
    checkValidates(jointz.number().max(0), 1, [
      { message: "1 must be less than or equal to 0", path: [], value: 1 },
    ]);
    checkValidates(jointz.number().min(2), 1, [
      { message: "1 must be greater than or equal to 2", path: [], value: 1 },
    ]);
  });

  it("isValid typeguards properly", () => {
    const validator = jointz.number();
    const value: unknown = 3.1;

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      // toPrecision only available on number type
      expect(value.toPrecision(1)).eq("3");
    }
  });

  it("has the right type", () => {
    const validator = jointz.number();

    assert<IsExact<ExtractResultType<typeof validator>, number>>(true);
  });
});
