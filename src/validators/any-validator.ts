import { ValidationError, Validator } from '../interfaces';

export default class AnyValidator extends Validator<any> {
  validate(value: any, path?: ReadonlyArray<string | number>): ValidationError[] {
    return [];
  }
}

export const ANY_VALIDATOR = new AnyValidator();