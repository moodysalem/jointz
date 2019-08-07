import { ValidationError, Validator } from '../interfaces';

interface NumberValidatorOptions {
  readonly multipleOf?: number;
  readonly min?: number;
  readonly max?: number;
}

export default class NumberValidator extends Validator<number> {
  private readonly options: NumberValidatorOptions;

  public constructor(options: NumberValidatorOptions) {
    super();
    this.options = options;
  }

  public min(min: number) {
    return new NumberValidator({ ...this.options, min });
  }

  public max(max: number) {
    return new NumberValidator({ ...this.options, max });
  }

  public multipleOf(multipleOf: number) {
    return new NumberValidator({ ...this.options, multipleOf });
  }

  public integer() {
    return this.multipleOf(1);
  }

  public validate(value: any, path: string = ''): ValidationError[] {
    const { multipleOf, min, max } = this.options;

    if (typeof value !== 'number') {
      return [ { message: `must be a number`, path, value } ];
    }

    const errors: ValidationError[] = [];

    if (multipleOf && value % multipleOf !== 0) {
      errors.push({
        message: multipleOf === 1 ? 'number was not an integer' : `number was not a multiple of ${multipleOf}`,
        path,
        value
      });
    }

    if (typeof min !== 'undefined' && value < min) {
      errors.push({ message: `${value} must be greater than or equal to ${min}`, path, value });
    }

    if (typeof max !== 'undefined' && value > max) {
      errors.push({ message: `${value} must be less than or equal to ${max}`, path, value });
    }

    return errors;
  }
}