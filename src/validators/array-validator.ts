import { ValidationError, Validator } from '../interfaces';

interface ArrayValidatorOptions<TItem> {
  readonly items?: Validator<TItem>;
  readonly minLength?: number;
  readonly maxLength?: number;
}

export default class ArrayValidator<TItem> extends Validator<TItem[]> {
  private readonly options: ArrayValidatorOptions<TItem>;

  public constructor(options: ArrayValidatorOptions<TItem>) {
    super();
    this.options = options;
  }

  public minLength(min: number) {
    return new ArrayValidator({ ...this.options, minLength: min });
  }

  public maxLength(max: number) {
    return new ArrayValidator({ ...this.options, maxLength: max });
  }

  public items(items: Validator<TItem>) {
    return new ArrayValidator({ ...this.options, items });
  }

  public validate(value: any, path: string = ''): ValidationError[] {
    const { items, minLength, maxLength } = this.options;

    if (typeof value !== 'object' || !Array.isArray(value)) {
      return [ { message: `must be an array`, path, value } ];
    }

    let errors: ValidationError[] = [];

    if (typeof minLength !== 'undefined' && value.length < minLength) {
      errors.push({ message: `array length ${value.length} was less than minimum length: ${minLength}`, path, value });
    }

    if (typeof maxLength !== 'undefined' && value.length > maxLength) {
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