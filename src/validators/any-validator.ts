import { ValidationError, Validator } from "../interfaces";

export default class AnyValidator extends Validator<any> {
  validate(
    value: any,
    path?: ReadonlyArray<string | number>
  ): ValidationError[] {
    return [];
  }

  isValid(value: any): value is any {
    return true;
  }

  checkValid(value: any): any {
    return true;
  }
}

export const ANY_VALIDATOR = new AnyValidator();
