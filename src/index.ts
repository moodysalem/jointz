import { Validator } from './interfaces';
import { spreadArgsToArray } from './util/spread-args-to-array';
import ArrayValidator from './validators/array-validator';
import ConstantValidator, { AllowedValueTypes } from './validators/constant-validator';
import NumberValidator from './validators/number-validator';
import ObjectValidator, { Keys } from './validators/object-validator';
import OrValidator from './validators/or-validator';
import StringValidator from './validators/string-validator';
import TupleValidator from './validators/tuple-validator';

export default abstract class jointz {
  static string(): StringValidator {
    return new StringValidator({});
  }

  static object(keys?: Keys): ObjectValidator {
    return new ObjectValidator({ keys, allowUnknownKeys: true });
  }

  static number(): NumberValidator {
    return new NumberValidator({});
  }

  static tuple(...validators: Validator[] | [ Validator[] ]): TupleValidator {
    return new TupleValidator({ validators: spreadArgsToArray(validators) });
  }

  static or(...validators: Validator[] | [ Validator[] ]): OrValidator {
    return new OrValidator({ validators: spreadArgsToArray(validators) });
  }

  static array(itemValidator?: Validator): ArrayValidator {
    return new ArrayValidator({ items: itemValidator });
  }

  static constant(...allowedValues: AllowedValueTypes[] | [ AllowedValueTypes[] ]): ConstantValidator {
    return new ConstantValidator({ allowedValues: spreadArgsToArray(allowedValues) });
  }
}