import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { ExtractResultType } from "../index";
import checkValidates from "../util/check-validates";

describe("jointz#string", () => {
  it("validates string type correctly", () => {
    checkValidates(jointz.string(), "", []);
    checkValidates(jointz.string(), void 0, [
      { message: "must be a string", path: [], value: void 0 },
    ]);
    checkValidates(jointz.string(), null, [
      { message: "must be a string", path: [], value: null },
    ]);
    checkValidates(jointz.string(), {}, [
      { message: "must be a string", path: [], value: {} },
    ]);
    checkValidates(
      jointz.string(),
      [],
      [{ message: "must be a string", path: [], value: [] }]
    );
  });

  it("validates patterns correctly", () => {
    checkValidates(jointz.string().pattern(/^[abc]{3,4}$/), "abc", []);
    checkValidates(jointz.string().pattern(/^[abc]{3,4}$/), "abcd", [
      { message: "did not match pattern", path: [], value: "abcd" },
    ]);
    checkValidates(jointz.string().pattern(/^[abc]{3,4}$/), "abca", []);
    checkValidates(jointz.string().pattern(/^[abc]{3,4}$/), "abcdab", [
      { message: "did not match pattern", path: [], value: "abcdab" },
    ]);
  });

  it("validates uuids correctly", () => {
    checkValidates(jointz.string().uuid(), "", [
      { message: "must be a uuid", path: [], value: "" },
    ]);
    checkValidates(
      jointz.string().uuid(),
      "C56A4180-65AA-42EC-A945-5FD21DEC0538",
      []
    );
    checkValidates(
      jointz.string().uuid(),
      "c56a4180-65aa-42Ec-A945-5FD21DEC0538",
      []
    );
  });

  it("validates alphanumeric", () => {
    checkValidates(jointz.string().alphanum(), "", []);
    checkValidates(jointz.string().alphanum(), "abcedF19309", []);
    checkValidates(
      jointz.string().alphanum(),
      "abc910394018fmdsklamf19045190580fmdklasfmdslamjgrqpmzcxklvmzlmty",
      []
    );
    checkValidates(
      jointz.string().alphanum(),
      "abc910394018fmdsklamf19045190580fmdklasfmdslamjgrqpmzcxklvmzlmty-",
      [
        {
          message: "must be alphanumeric",
          path: [],
          value:
            "abc910394018fmdsklamf19045190580fmdklasfmdslamjgrqpmzcxklvmzlmty-",
        },
      ]
    );
  });

  it("validates minLength and maxLength length properly", () => {
    checkValidates(
      jointz
        .string()
        .pattern(/^[abc]{3,4}$/)
        .maxLength(3),
      "abca",
      [
        {
          path: [],
          message: "length 4 was longer than maximum length: 3",
          value: "abca",
        },
      ]
    );
    checkValidates(
      jointz
        .string()
        .pattern(/^[abc]{3,4}$/)
        .maxLength(3),
      "abcd",
      [
        { path: [], message: "did not match pattern", value: "abcd" },
        {
          path: [],
          message: "length 4 was longer than maximum length: 3",
          value: "abcd",
        },
      ]
    );
  });

  it("validates email propertly", () => {
    checkValidates(jointz.string().email(), "this is not an email", [
      {
        message: "must be a valid email",
        path: [],
        value: "this is not an email",
      },
    ]);
    checkValidates(jointz.string().email(), "email1@email.com", []);
    checkValidates(jointz.string().email(), "super@email.test", []);
    checkValidates(jointz.string().email(), "complex+email.a@dom.dom.dom", []);
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
