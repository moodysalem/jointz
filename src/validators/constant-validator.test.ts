import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { ExtractResultType } from "../index";

describe("jointz#constant", () => {
  it("allows only allowed values", () => {
    expect(jointz.constant("def").validate("def")).to.deep.eq([]);
    expect(jointz.constant("def").validate("deff")).to.deep.eq([
      { message: 'must be one of "def"', path: [], value: "deff" },
    ]);
  });

  it("throws with invalid allowed values", () => {
    expect(() => jointz.constant({} as any)).to.throw();
    expect(() => jointz.constant([] as any)).to.throw();
  });

  it("allows null and undefined", () => {
    expect(jointz.constant(null).validate(null)).to.deep.eq([]);
    expect(jointz.constant(undefined).validate(undefined)).to.deep.eq([]);
    expect(jointz.constant(null).validate(undefined))
      .to.be.an("array")
      .with.length(1);
    expect(jointz.constant(undefined).validate(null))
      .to.be.an("array")
      .with.length(1);
  });

  it("throws with empty list", () => {
    expect(() => jointz.constant()).to.throw();
  });

  it("only works with allowed values", () => {
    expect(jointz.constant("abc", "def").validate("def")).to.deep.eq([]);
    expect(
      jointz.constant("abc", "def", 123, false).validate("abc")
    ).to.deep.eq([]);
    expect(jointz.constant("abc", "def", 123, false).validate(123)).to.deep.eq(
      []
    );
    expect(
      jointz.constant("abc", "def", 123, false).validate(false)
    ).to.deep.eq([]);
    expect(jointz.constant("abc", "def", 0, false).validate(0)).to.deep.eq([]);
    expect(
      jointz.constant("abc", "def", 123, false).validate({}, ["def"])
    ).to.deep.eq([
      {
        message: 'must be one of "abc", "def", 123, false',
        path: ["def"],
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
