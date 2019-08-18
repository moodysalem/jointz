import { ValidationError, Validator } from '../interfaces';

type TupleValidators<T extends Array<any>> = { [K in keyof T]: Validator<T[K]> }

interface TupleValidatorOptions<TTuple extends Array<any>> {
  readonly validators: TupleValidators<TTuple>;
}

/**
 * Returns a validator that checks the value is a tuple, i.e. an array with a fixed number of elements that match the
 * given validators.
 */
export default class TupleValidator<TTuple extends Array<any>> extends Validator<TTuple> {
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