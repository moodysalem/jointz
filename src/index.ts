import {
  ExtractResultType,
  FailedValidationError,
  ValidationError,
  Validator,
  Infer,
  ValidationErrorPath,
} from "./interfaces";
import { spreadArgsToArray } from "./util/spread-args-to-array";
import AnyValidator, { ANY_VALIDATOR } from "./validators/any-validator";
import ArrayValidator from "./validators/array-validator";
import ConstantValidator, {
  AllowedValueTypes,
} from "./validators/constant-validator";
import NumberValidator from "./validators/number-validator";
import ObjectValidator, { Keys } from "./validators/object-validator";
import OrValidator from "./validators/or-validator";
import StringValidator from "./validators/string-validator";
import TupleValidator from "./validators/tuple-validator";
import { BOOLEAN_VALIDATOR } from "./validators/boolean-validator";
import JsonValidator from "./validators/json-validator";

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
   * Create a validator that checks that the value is an object with a given shape.
   *
   * By default the object is not allowed to have keys other than what are specified.
   * Call `allowUnknownKeys(true)` on the returned object validator to allow the object to have keys that are not
   * specified which are not validated.
   *
   * @param keys validation to apply to each key in the object
   */
  static object<TKeys extends Keys>(
    keys: TKeys
  ): ObjectValidator<TKeys, never, false> {
    return new ObjectValidator({
      keys,
      requiredKeys: [],
      allowUnknownKeys: false,
    });
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
  static tuple<T extends Validator<unknown>[]>(
    ...validators: T | [T]
  ): TupleValidator<Infer<T>> {
    return new TupleValidator({
      validators: spreadArgsToArray(validators),
    }) as any;
  }

  /**
   * Combine a list of validators to produce a new validator that passes if any of the given validators pass
   * @param validators validators to combine into an OR expression validator
   */
  static or<T extends Validator<any>[]>(
    ...validators: T | [T]
  ): OrValidator<Infer<T>[number]> {
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
   * @param allowedValues the values that are considered valid. can be numbers, strings, booleans, `null`, or `undefined`
   */
  static constant<T extends Array<AllowedValueTypes>>(
    ...allowedValues: T
  ): ConstantValidator<T> {
    return new ConstantValidator<T>({ allowedValues: allowedValues });
  }

  /**
   * Return a validator that checks that the value is either true or false.
   * This is an alias for constructing a constant validator.
   */
  static boolean(): Validator<boolean> {
    return BOOLEAN_VALIDATOR;
  }

  /**
   * Return a validator that always succeeds but does not limit the type.
   */
  static any(): AnyValidator {
    return ANY_VALIDATOR;
  }

  /**
   * Return a validator that checks the string contains JSON that when parsed matches some validation
   * @param parsed the validation to be applied to the parsed JSON
   */
  static json<T>(parsed: Validator<T>): Validator<string> {
    return new JsonValidator(parsed);
  }
}

export {
  Validator,
  ValidationError,
  ExtractResultType,
  Infer,
  FailedValidationError,
  ValidationErrorPath,
};
