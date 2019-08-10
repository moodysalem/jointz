import { ExtractResultType, FailedValidationError, ValidationError, Validator } from './interfaces';
import { SpreadArgs, spreadArgsToArray } from './util/spread-args-to-array';
import ArrayValidator from './validators/array-validator';
import ConstantValidator, { AllowedValueTypes } from './validators/constant-validator';
import NumberValidator from './validators/number-validator';
import ObjectValidator, { ExtractObjectType, Keys } from './validators/object-validator';
import OrValidator from './validators/or-validator';
import StringValidator from './validators/string-validator';
import TupleValidator from './validators/tuple-validator';

/**
 * The default export of the jointz library that exposes static methods for constructing validators.
 */
export default abstract class jointz {
  /**
   * Create a validator that checks the value is a string.
   */
  static string(): StringValidator {
    return new StringValidator({});
  }

  /**
   * Create a validator that checks that the value is an object, optionally with validators applied to some keys
   * @param keys validation to apply to the values
   */
  static object<TKeys extends Keys>(keys?: TKeys): ObjectValidator<ExtractObjectType<TKeys>> {
    return new ObjectValidator({ keys, allowUnknownKeys: true });
  }

  /**
   * Create a validator that checks that the value is a number. Call additional methods to add constraints to the number.
   */
  static number(): NumberValidator {
    return new NumberValidator({});
  }

  /**
   * Create a validator that checks that the given value is a tuple of values that match the given validators.
   * @param validators list of validators that the items in the tuple should match in order
   */
  static tuple(...validators: SpreadArgs<Validator<any>>): TupleValidator<any> {
    return new TupleValidator({ validators: spreadArgsToArray(validators) });
  }

  /**
   * Combine a list of validators to produce a new validator that passes if any of the given validators pass
   * @param validators validators to combine into an OR expression validator
   */
  static or(...validators: SpreadArgs<Validator<any>>): OrValidator<any> {
    return new OrValidator({ validators: spreadArgsToArray(validators) });
  }

  /**
   * Return a validator that checks the value is an array, optionally validating each item in the array
   * @param itemValidator validator for the individual array items
   */
  static array<TItem>(itemValidator?: Validator<TItem>): ArrayValidator<TItem> {
    return new ArrayValidator({ items: itemValidator });
  }

  /**
   * Return a constant validator that checks that the value is one of a set of given values.
   * @param allowedValues the values that are allowed. can be number, string, boolean, null, undefined
   */
  static constant<T extends AllowedValueTypes>(...allowedValues: SpreadArgs<T>): ConstantValidator<T> {
    return new ConstantValidator({ allowedValues: spreadArgsToArray(allowedValues) });
  }
}

export { Validator, ValidationError, ExtractResultType, FailedValidationError };