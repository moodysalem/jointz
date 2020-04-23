import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { ExtractResultType } from "../index";

describe("jointz#tuple", () => {
  it("validates item is array", () => {
    expect(jointz.tuple([jointz.constant(0)]).validate(0))
      .to.be.an("array")
      .with.length(1);
    expect(jointz.tuple([jointz.constant(0)]).validate([0]))
      .to.be.an("array")
      .with.length(0);
  });

  it("error if missing items", () => {
    expect(jointz.tuple([jointz.constant("a")]).validate([])).to.deep.eq([
      { path: [0], message: 'must be one of "a"', value: undefined },
    ]);
  });

  it("error if too long", () => {
    expect(
      jointz.tuple([jointz.constant("a")]).validate(["a", "b"])
    ).to.deep.eq([
      {
        path: [],
        message: "array length 2 was greater than expected length 1",
        value: ["a", "b"],
      },
    ]);
  });

  it("works with varargs", () => {
    expect(
      jointz
        .tuple(jointz.constant("abc", "def"), jointz.number())
        .validate(["def", 3])
    ).to.deep.eq([]);
  });

  it("uses the path for type check", () => {
    expect(
      jointz.tuple(jointz.number(), jointz.string()).validate({}, ["abc"])
    ).to.deep.eq([{ path: ["abc"], value: {}, message: "must be an array" }]);
  });

  it("uses the path for each item", () => {
    expect(
      jointz.tuple(jointz.number(), jointz.string()).validate(["1", 2], ["abc"])
    ).to.deep.eq([
      { path: ["abc", 0], value: "1", message: "must be a number" },
      { path: ["abc", 1], value: 2, message: "must be a string" },
    ]);
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

    assert<IsExact<ExtractResultType<typeof validator>, [number, string]>>(
      true
    );
  });
});
