import { ValidationError, Validator } from '../interfaces';

interface TupleValidatorOptions<TValidators extends Validator<any>[]> {
  readonly validators: TValidators;
}

export default class TupleValidator<TTuple extends Validator<any>[]> extends Validator<TTuple> {
  private readonly options: TupleValidatorOptions<TTuple>;

  public constructor(options: TupleValidatorOptions<TTuple>) {
    super();
    this.options = options;
  }

  public validate(value: any, path: string = ''): ValidationError[] {
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