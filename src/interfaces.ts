export type ValidationErrorPath = Readonly<Array<string | number>>;

/**
 * Information about a failed validation.
 */
export interface ValidationError {
  // Where in th given value the error
  readonly path: ValidationErrorPath;
  // The message about the validation.
  readonly message: string;
  // The value that failed validation.
  readonly value?: any;
}

/**
 * The validation error that is thrown from checkValid.
 */
export class FailedValidationError extends Error {
  public readonly isFailedValidationError: true = true;
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(
      errors
        .map(({ path, message }) =>
          [path.join("."), message].filter((v) => v.length > 0).join(": ")
        )
        .join("; ")
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
  public abstract validate(
    value: unknown,
    path?: ValidationErrorPath
  ): ValidationError[];

  /**
   * Return true if the value is valid. #isValid is unique in that validation errors are not surfaced, so the validator
   * may optimize for performance.
   * @param value value to check
   */
  public isValid(value: unknown): value is TValid {
    return this.validate(value).length === 0;
  }

  /**
   * Validate the given value and throw if it's not valid
   * @param value that is TValid
   */
  public checkValid(value: unknown): TValid {
    const errors = this.validate(value);

    if (errors.length > 0) {
      throw new FailedValidationError(errors);
    }

    return value as any as TValid;
  }
}

/**
 * Extracts the result type from a validator. Define your validator and then use this to get the type of result.
 */
export type Infer<TValidator> = TValidator extends Validator<infer T>
  ? T
  : TValidator extends Validator<any>[]
  ? {
      [P in keyof TValidator]: Infer<TValidator[P]>;
    }
  : TValidator extends {}
  ? {
      [P in keyof TValidator]: Infer<TValidator[P]>;
    }
  : unknown;

// Legacy alias for Infer
export type ExtractResultType<TValidator> = Infer<TValidator>;
