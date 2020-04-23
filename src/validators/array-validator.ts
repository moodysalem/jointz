import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";

interface ArrayValidatorOptions<TItem> {
  readonly items?: Validator<TItem>;
  readonly minLength?: number;
  readonly maxLength?: number;
}

/**
 * Validator that checks that the value is an array of a particular kind of item
 */
export default class ArrayValidator<TItem> extends Validator<TItem[]> {
  private readonly options: ArrayValidatorOptions<TItem>;

  public constructor(options: ArrayValidatorOptions<TItem>) {
    super();
    this.options = options;
  }

  /**
   * A valid array must have at least min elements
   * @param min min array length
   */
  public minLength(min: number) {
    if (min < 0) {
      throw new Error(`min length ${min} must be greater than or equal to 0`);
    }
    return new ArrayValidator({ ...this.options, minLength: min });
  }

  /**
   * A valid array must have at most max elements
   * @param max max array length
   */
  public maxLength(max: number) {
    if (max < 0) {
      throw new Error(`max length ${max} must be greater than or equal to 0`);
    }
    return new ArrayValidator({ ...this.options, maxLength: max });
  }

  /**
   * Specify the type of the item allowed for the array validator
   * @param items type of items allowed in the array
   */
  public items<TItem>(items: Validator<TItem>): ArrayValidator<TItem> {
    return new ArrayValidator({ ...this.options, items });
  }

  public validate(
    value: any,
    path: ValidationErrorPath = []
  ): ValidationError[] {
    const { items, minLength, maxLength } = this.options;

    if (typeof value !== "object" || !Array.isArray(value)) {
      return [{ message: `must be an array`, path, value }];
    }

    let errors: ValidationError[] = [];

    if (minLength !== undefined && value.length < minLength) {
      errors.push({
        message: `array length ${value.length} was less than minimum length: ${minLength}`,
        path,
        value,
      });
    }

    if (maxLength !== undefined && value.length > maxLength) {
      errors.push({
        message: `array length ${value.length} was greater than maximum length: ${maxLength}`,
        path,
        value,
      });
    }

    if (errors.length === 0 && items) {
      for (let i = 0; i < value.length; i++) {
        errors = errors.concat(items.validate(value[i], [...path, i]));
      }
    }

    return errors;
  }

  isValid(value: any): value is TItem[] {
    const { minLength, maxLength, items } = this.options;
    if (
      typeof value === "object" &&
      Array.isArray(value) &&
      (minLength === undefined || value.length >= minLength) &&
      (maxLength === undefined || value.length <= maxLength)
    ) {
      if (items) {
        for (let x of value) {
          if (!items.checkValid(x)) {
            return false;
          }
        }
        return true;
      } else {
        return true;
      }
    }
    return false;
  }
}
