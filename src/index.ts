import { Validator } from './interfaces';
import NumberValidator from './validators/number-validator';
import ObjectValidator from './validators/object-validator';
import OrValidator from './validators/or-validator';
import StringValidator from './validators/string-validator';

export default class Joint {
  static string() {
    return new StringValidator({});
  }

  static object() {
    return new ObjectValidator({ allowUnknownKeys: true });
  }

  static number() {
    return new NumberValidator({});
  }

  static or(validators: Validator[]) {
    return new OrValidator({ validators });
  }
}