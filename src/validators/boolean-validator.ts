import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";
import { JSONSchema7 } from "json-schema";

export default class BooleanValidator extends Validator<boolean> {
  validate(value: any, path: ValidationErrorPath = []): ValidationError[] {
    if (value === true || value === false) {
      return [];
    }
    return [{ path, message: "must be a boolean", value }];
  }

  isValid(value: any): value is boolean {
    return value === true || value === false;
  }

  _toJsonSchema(): JSONSchema7 {
    return {
      type: "boolean",
    };
  }
}

export const BOOLEAN_VALIDATOR = new BooleanValidator();
