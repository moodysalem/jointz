import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";

export default class BooleanValidator extends Validator<boolean> {
  validate(value: any, path: ValidationErrorPath = []): ValidationError[] {
    if (typeof value === "boolean") {
      return [];
    }
    return [{ path, message: "must be a boolean", value }];
  }

  isValid(value: any): value is boolean {
    return typeof value === "boolean";
  }
}

export const BOOLEAN_VALIDATOR = new BooleanValidator();
