import { ValidationError, Validator } from "../interfaces";

export default class AnyValidator extends Validator<unknown> {
  validate(
    value: unknown,
    path?: ReadonlyArray<string | number>
  ): ValidationError[] {
    return [];
  }

  isValid(value: unknown): value is unknown {
    return true;
  }

  checkValid(value: unknown): unknown {
    return true;
  }
}

export const ANY_VALIDATOR = new AnyValidator();
