import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";
import { JSONSchema7 } from "json-schema";

/**
 * Validates that a string contains JSON that when parsed matches the given validator
 */
export default class JsonValidator<TParsed> extends Validator<string> {
  private readonly parsedValidator: Validator<TParsed>;

  public constructor(parsedValidator: Validator<TParsed>) {
    super();
    this.parsedValidator = parsedValidator;
  }

  validate(value: unknown, path: ValidationErrorPath = []): ValidationError[] {
    if (typeof value !== "string") {
      return [
        { path, message: "must be a string containing valid json", value },
      ];
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      return [{ path, message: "invalid json", value }];
    }

    return this.parsedValidator.validate(parsed, path);
  }

  isValid(value: unknown): value is string {
    try {
      return (
        typeof value === "string" &&
        this.parsedValidator.isValid(JSON.parse(value))
      );
    } catch (error) {
      return false;
    }
  }

  _toJsonSchema(): JSONSchema7 {
    return {
      type: "string",
      contentMediaType: "application/json",
      // next version of json schema
      // contentSchema: this.parsedValidator.toJsonSchema(),
    };
  }
}
