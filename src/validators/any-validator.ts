import { ValidationError, Validator } from "../interfaces";
import { JSONSchema7 } from "json-schema";

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

  _toJsonSchema(): JSONSchema7 {
    return {};
  }
}

export const ANY_VALIDATOR = new AnyValidator();
