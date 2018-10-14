import { Validator } from './interfaces';
import NumberValidator from './validators/number-validator';
import ObjectValidator from './validators/object-validator';
import OrValidator from './validators/or-validator';
import StringValidator from './validators/string-validator';
import ArrayValidator from './validators/array-validator';

export default abstract class jointz {
  static string(): StringValidator {
    return new StringValidator({});
  }

  static object(): ObjectValidator {
    return new ObjectValidator({ allowUnknownKeys: true });
  }

  static number(): NumberValidator {
    return new NumberValidator({});
  }

  static or(...validators: Validator[]): OrValidator {
    return new OrValidator({ validators });
  }

  static array(): ArrayValidator {
    return new ArrayValidator({});
  }
}