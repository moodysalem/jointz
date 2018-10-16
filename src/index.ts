import { Validator } from './interfaces';
import ArrayValidator from './validators/array-validator';
import ConstantValidator, { AllowedValueTypes } from './validators/constant-validator';
import NumberValidator from './validators/number-validator';
import ObjectValidator from './validators/object-validator';
import OrValidator from './validators/or-validator';
import StringValidator from './validators/string-validator';

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

  static constant(...allowedValues: AllowedValueTypes[]): ConstantValidator {
    return new ConstantValidator({ allowedValues: allowedValues });
  }
}