import { JSONSchema7 } from "json-schema";
import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";

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

  /**
   * Limit the number to be greater than or equal to the min
   * @param min min number
   */
  public min(min: number) {
    return new NumberValidator({ ...this.options, min });
  }

  /**
   * Limit the number to be less than or equal to the max
   * @param max max number
   */
  public max(max: number) {
    return new NumberValidator({ ...this.options, max });
  }

  /**
   * Limit the number validator to only allow numbers that are a multiple of the given value
   * @param multipleOf number that a valid value must be a multiple of
   */
  public multipleOf(multipleOf: number) {
    return new NumberValidator({ ...this.options, multipleOf });
  }

  /**
   * Limit the number validator to only allow integers. Alias to #multipleOf(1).
   */
  public integer() {
    return this.multipleOf(1);
  }

  public validate(
    value: any,
    path: ValidationErrorPath = []
  ): ValidationError[] {
    const { multipleOf, min, max } = this.options;

    if (typeof value !== "number") {
      return [{ message: `must be a number`, path, value }];
    }

    const errors: ValidationError[] = [];

    if (multipleOf && value % multipleOf !== 0) {
      errors.push({
        message:
          multipleOf === 1
            ? "number was not an integer"
            : `number was not a multiple of ${multipleOf}`,
        path,
        value,
      });
    }

    if (typeof min !== "undefined" && value < min) {
      errors.push({
        message: `${value} must be greater than or equal to ${min}`,
        path,
        value,
      });
    }

    if (typeof max !== "undefined" && value > max) {
      errors.push({
        message: `${value} must be less than or equal to ${max}`,
        path,
        value,
      });
    }

    return errors;
  }

  isValid(value: any): value is number {
    const { max, min, multipleOf } = this.options;
    return (
      typeof value === "number" &&
      (max === undefined || value <= max) &&
      (min === undefined || value >= min) &&
      (multipleOf === undefined || value % multipleOf === 0)
    );
  }

  public _toJsonSchema(): JSONSchema7 {
    return {
      type: "number",
      multipleOf: this.options.multipleOf,
      minimum: this.options.min,
      maximum: this.options.max,
    };
  }
}
