import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { Infer } from "../index";
import checkValidates from "../util/check-validates";

describe("jointz#tuple", () => {
  it("validates item is array", () => {
    checkValidates(jointz.tuple([jointz.constant(0)]), 0, [
      { message: "must be an array", path: [], value: 0 },
    ]);
    checkValidates(jointz.tuple([jointz.constant(0)]), [0], []);
  });

  it("error if missing items", () => {
    checkValidates(
      jointz.tuple([jointz.constant("a")]),
      [],
      [{ path: [0], message: 'must be one of "a"', value: undefined }]
    );
  });

  it("error if too long", () => {
    checkValidates(
      jointz.tuple([jointz.constant("a")]),
      ["a", "b"],
      [
        {
          path: [],
          message: "array length 2 was greater than expected length 1",
          value: ["a", "b"],
        },
      ]
    );
  });

  it("works with varargs", () => {
    checkValidates(
      jointz.tuple(jointz.constant("abc", "def"), jointz.number()),
      ["def", 3],
      []
    );
  });

  it("uses the path for each item", () => {
    checkValidates(
      jointz.tuple(jointz.number(), jointz.string()),
      ["1", 2],
      [
        { path: [0], value: "1", message: "must be a number" },
        { path: [1], value: 2, message: "must be a string" },
      ]
    );
  });

  it("isValid typeguards properly", () => {
    const validator = jointz.tuple(jointz.string(), jointz.number());
    const value: unknown = ["abc", 123];

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      // substring only available on string type
      expect(value[0].substring(0, 1)).eq("a");
      expect(value[1].toFixed(1)).eq("123.0");
    }
  });

  it("has the right type", () => {
    const validator = jointz.tuple(jointz.number(), jointz.string());

    assert<IsExact<Infer<typeof validator>, [number, string]>>(true);
  });
});
