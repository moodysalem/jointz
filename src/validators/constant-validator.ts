import { ValidationError, Validator } from '../interfaces';

export type AllowedValueTypes = string | number | boolean | null | undefined;

function isSupportedValueType(value: any) {
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined' ||
    value === null;
}

interface ConstantValidatorOptions {
  allowedValues: AllowedValueTypes[]
}

export default class ConstantValidator implements Validator {
  private readonly options: ConstantValidatorOptions;

  public constructor(options: ConstantValidatorOptions) {
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

  validate(value: any, path: string = ''): ValidationError[] {
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