import { expect } from "chai";
import { describe, it } from "mocha";
import { ValidationError, Validator, FailedValidationError } from "./index";
import { JSONSchema7 } from "json-schema";

class CustomValidator extends Validator<string> {
  validate(value: any, path: Array<string> = []): ValidationError[] {
    return typeof value === "string"
      ? []
      : [{ message: "not a string", path, value }];
  }

  _toJsonSchema(): JSONSchema7 {
    return {
      type: "string",
    };
  }
}

describe("Validator", () => {
  const validator = new CustomValidator();

  it("validate", () => {
    expect(validator.validate("abc")).to.be.an("array").with.length(0);
  });

  it("checkValid throws", () => {
    expect(() => validator.checkValid(1)).to.throw("not a string");
  });

  it("check valid error type", () => {
    let threw = false;
    try {
      validator.checkValid(1);
    } catch (error: any) {
      threw = true;
      expect(error.isFailedValidationError).to.eq(true);
      expect(error.message).to.eq("not a string");
      expect(error.errors).to.deep.eq([
        { message: "not a string", path: [], value: 1 },
      ]);
    }
    expect(threw).to.eq(true);
  });

  it("isValid typeguards", () => {
    const value: unknown = "abc";
    expect(validator.isValid(value)).eq(true);
    if (validator.isValid(value)) {
      expect(value.substring(0, 1)).to.eq("a");
    }
  });

  it("checkValid returns the value when valid", () => {
    const value: unknown = "abc";
    const result: string = validator.checkValid(value);
    expect(result).to.eq("abc");
  });

  it("FailedValidationError calls super constructor", () => {
    expect(
      new FailedValidationError([{ message: "abc", path: ["abc", 1, "def"] }])
        .message
    ).to.eq("abc.1.def: abc");
  });
});
