/**
 * Information about a failed validation.
 */
export interface ValidationError {
  // Where in th given value the error
  readonly path: string;
  // The message about the validation.
  readonly message: string;
  // The value that failed validation.
  readonly value?: any;
}

/**
 * The validation error that is thrown from validateThrow.
 */
export class ValidationErrorThrow extends Error {
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(
      errors.map(
        ({ path, message }) => `${path}: ${message}`
      ).join('; ')
    );
    this.errors = errors;
  }
}

/**
 * The base class of all the validators in this package. TValid is the type of any value that passes validation.
 */
export abstract class Validator<TValid> {
  /**
   * Validate a given value with the assumed path, returning any errors
   * @param value value to validate
   * @param path current path of the validation
   */
  public abstract validate(value: any, path?: string): ValidationError[];

  /**
   * Return true if the value is valid
   * @param value value to check
   */
  public isValid(value: any): value is TValid {
    return this.validate(value).length === 0;
  }

  /**
   * Validate the given value and throw if it's not valid
   * @param value that is TValid
   */
  public checkValid(value: any): value is TValid {
    const errors = this.validate(value);

    if (errors.length > 0) {
      throw new ValidationErrorThrow(errors);
    }

    return true;
  }
}