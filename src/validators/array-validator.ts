import { ValidationError, Validator } from '../interfaces';

interface ArrayValidatorOptions {
  readonly items?: Validator;
  readonly minLength?: number;
  readonly maxLength?: number;
}

export default class ArrayValidator implements Validator {
  private readonly options: ArrayValidatorOptions;

  public constructor(options: ArrayValidatorOptions) {
    this.options = options;
  }

  public minLength(min: number) {
    return new ArrayValidator({ ...this.options, minLength: min });
  }

  public maxLength(max: number) {
    return new ArrayValidator({ ...this.options, maxLength: max });
  }

  public items(items: Validator) {
    return new ArrayValidator({ ...this.options, items });
  }

  validate(value: any, path: string = ''): ValidationError[] {
    const { items, minLength, maxLength } = this.options;

    if (typeof value !== 'object' || !Array.isArray(value)) {
      return [ { message: `not an array`, path, value } ];
    }

    let errors: ValidationError[] = [];

    if (minLength && value.length < minLength) {
      errors.push({ message: `array length ${value.length} was less than minimum length: ${minLength}`, path, value });
    }

    if (maxLength && value.length > maxLength) {
      errors.push({
        message: `array length ${value.length} was greater than maximum length: ${maxLength}`,
        path,
        value
      });
    }

    if (errors.length === 0 && items) {
      for (let i = 0; i < value.length; i++) {
        errors = errors.concat(items.validate(value[ i ], `${path}.${i}`));
      }
    }

    return errors;
  }
}