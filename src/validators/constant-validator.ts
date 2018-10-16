import { ValidationError, Validator } from '../interfaces';

export type AllowedValueTypes = string | number | boolean;

function isSupportedValueType(value: any) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
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
        throw new Error('unsupported value type in constant validator, must be string boolean or number');
      }
    }

    this.options = options;
  }

  validate(value: any, path: string = ''): ValidationError[] {
    const { allowedValues } = this.options;

    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      return [ {
        path,
        message: 'value was not one of the supported constant types: string, number or boolean',
        value
      } ];
    }

    if (allowedValues.indexOf(value) === -1) {
      return [ {
        path,
        message: 'value was not one of the allowed values',
        value
      } ];
    }

    return [];
  }
}