import { ValidationError, Validator } from '../interfaces';

export type AllowedValueTypes = string | number | boolean | null | undefined;

const SUPPORTED_VALUE_TYPEOF: readonly string[] = [ 'string', 'number', 'boolean', 'undefined' ];

/**
 * Return true if the given value is one of the supported value types
 * @param value to check
 */
function isSupportedValueType(value: any): value is null | undefined | string | number | boolean {
  return value === null || SUPPORTED_VALUE_TYPEOF.indexOf(typeof value) !== -1;
}

interface ConstantValidatorOptions {
  readonly allowedValues: AllowedValueTypes[];
}

/**
 * Validator that checks that a value is one of a given set of constants
 */
export default class ConstantValidator<TValues> extends Validator<TValues> {
  private readonly options: ConstantValidatorOptions;

  public constructor(options: ConstantValidatorOptions) {
    super();

    if (options.allowedValues.length === 0) {
      throw new Error('constant validators should have at least one value');
    }

    for (let i in options.allowedValues) {
      if (!isSupportedValueType(options.allowedValues[ i ])) {
        throw new Error('unsupported value type in constant validator, must be string, boolean, number, null or undefined');
      }
    }

    this.options = options;
  }

  public validate(value: any, path: string = ''): ValidationError[] {
    const { allowedValues } = this.options;

    if (allowedValues.indexOf(value) === -1) {
      return [ {
        path,
        message: `must be one of ${this.options.allowedValues.map(v => typeof v === 'string' ? `"${v}"` : `${v}`).join(', ')}`,
        value
      } ];
    }

    return [];
  }
}