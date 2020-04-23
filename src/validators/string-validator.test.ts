import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { ExtractResultType } from "../index";

describe("jointz#string", () => {
  it("validates string type correctly", () => {
    expect(jointz.string().validate("")).to.be.an("array").with.length(0);
    expect(jointz.string().validate(void 0)).to.deep.eq([
      { message: "must be a string", path: [], value: void 0 },
    ]);
    expect(jointz.string().validate(null)).to.deep.eq([
      { message: "must be a string", path: [], value: null },
    ]);
    expect(jointz.string().validate({})).to.deep.eq([
      { message: "must be a string", path: [], value: {} },
    ]);
    expect(jointz.string().validate([])).to.deep.eq([
      { message: "must be a string", path: [], value: [] },
    ]);
  });

  it("validates patterns correctly", () => {
    expect(
      jointz
        .string()
        .pattern(/^[abc]{3,4}$/)
        .validate("abc", [])
    ).to.deep.eq([]);
    expect(
      jointz
        .string()
        .pattern(/^[abc]{3,4}$/)
        .validate("abcd", [])
    ).to.deep.eq([
      { message: "did not match pattern", path: [], value: "abcd" },
    ]);
    expect(
      jointz
        .string()
        .pattern(/^[abc]{3,4}$/)
        .validate("abca", [])
    ).to.deep.eq([]);
    expect(
      jointz
        .string()
        .pattern(/^[abc]{3,4}$/)
        .validate("abcdab", [])
    ).to.deep.eq([
      { message: "did not match pattern", path: [], value: "abcdab" },
    ]);
  });

  it("validates uuids correctly", () => {
    expect(jointz.string().uuid().validate("")).to.deep.eq([
      { message: "must be a uuid", path: [], value: "" },
    ]);
    expect(
      jointz.string().uuid().validate("C56A4180-65AA-42EC-A945-5FD21DEC0538")
    ).to.deep.eq([]);
    expect(
      jointz.string().uuid().validate("c56a4180-65aa-42Ec-A945-5FD21DEC0538")
    ).to.deep.eq([]);
  });

  it("validates alphanumeric", () => {
    expect(jointz.string().alphanum().validate("")).to.deep.eq([]);
    expect(jointz.string().alphanum().validate("abcedF19309")).to.deep.eq([]);
    expect(
      jointz
        .string()
        .alphanum()
        .validate(
          "abc910394018fmdsklamf19045190580fmdklasfmdslamjgrqpmzcxklvmzlmty"
        )
    ).to.deep.eq([]);
    expect(
      jointz
        .string()
        .alphanum()
        .validate(
          "abc910394018fmdsklamf19045190580fmdklasfmdslamjgrqpmzcxklvmzlmty-"
        )
    ).to.deep.eq([
      {
        message: "must be alphanumeric",
        path: [],
        value:
          "abc910394018fmdsklamf19045190580fmdklasfmdslamjgrqpmzcxklvmzlmty-",
      },
    ]);
  });

  it("validates minLength and maxLength length properly", () => {
    expect(
      jointz
        .string()
        .pattern(/^[abc]{3,4}$/)
        .maxLength(3)
        .validate("abca", [])
    )
      .to.be.an("array")
      .with.length(1);
    expect(
      jointz
        .string()
        .pattern(/^[abc]{3,4}$/)
        .maxLength(3)
        .validate("abcd", [])
    )
      .to.be.an("array")
      .with.length(2);
  });

  it("validates email propertly", () => {
    expect(
      jointz.string().email().validate("this is not an email", [])
    ).to.deep.eq([
      {
        message: "must be a valid email",
        path: [],
        value: "this is not an email",
      },
    ]);
    expect(jointz.string().email().validate("email1@email.com", [])).to.deep.eq(
      []
    );
    expect(jointz.string().email().validate("super@email.test", [])).to.deep.eq(
      []
    );
    expect(
      jointz.string().email().validate("complex+email.a@dom.dom.dom", [])
    ).to.deep.eq([]);
  });

  it("throws with invalid minLength", () => {
    expect(() => jointz.string().minLength(-1)).to.throw(
      "min length -1 must be greater than or equal to 0"
    );
  });

  it("throws with invalid maxLength", () => {
    expect(() => jointz.string().maxLength(-1)).to.throw(
      "max length -1 must be greater than or equal to 0"
    );
  });

  it("isValid typeguards properly", () => {
    const validator = jointz.string();
    const value: unknown = "abc";

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      // substring only available on string type
      expect(value.substring(0, 1)).eq("a");
    }
  });

  it("has the right type", () => {
    const validator = jointz.string();

    assert<IsExact<ExtractResultType<typeof validator>, string>>(true);
  });
});
