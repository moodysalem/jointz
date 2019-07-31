import { ValidationError, Validator } from '../interfaces';

interface TupleValidatorOptions {
  readonly validators: Validator[];
}

export default class TupleValidator implements Validator {
  private readonly options: TupleValidatorOptions;

  public constructor(options: TupleValidatorOptions) {
    this.options = options;
  }

  validate(value: any, path: string = ''): ValidationError[] {
    const { validators } = this.options;

    if (!Array.isArray(value)) {
      return [ { message: `must be an array`, path, value } ];
    }

    let errors: ValidationError[] = [];

    for (let i = 0; i < validators.length; i++) {
      errors = errors.concat(validators[ i ].validate(value[ i ], `${path}.${i}`));
    }

    if (value.length > validators.length) {
      errors.push({
        value,
        path,
        message: `array length ${value.length} was greater than expected length ${validators.length}`
      });
    }

    return errors;
  }
}