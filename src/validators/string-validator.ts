import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";

const ALPHANUMERIC_REGEX = /^[a-z0-9]*$/i;
const UUID_REGEX = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

/**
 * Based on https://stackoverflow.com/a/46181/1126380
 */
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

interface StringValidatorOptions {
  readonly pattern?: RegExp;
  readonly minLength?: number;
  readonly maxLength?: number;
}

const SPECIAL_REGEX_MESSAGES: { [regexSource: string]: string } = {
  [ALPHANUMERIC_REGEX.source]: "must be alphanumeric",
  [UUID_REGEX.source]: "must be a uuid",
  [EMAIL_REGEX.source]: "must be a valid email",
};

/**
 * Validates that a given value is a string with some format and minimum or maximum length.
 */
export default class StringValidator extends Validator<string> {
  private readonly options: StringValidatorOptions;

  public constructor(options: StringValidatorOptions) {
    super();
    this.options = options;
  }

  /**
   * Return a new validator that checks the string is not shorter than the given length.
   * @param min
   */
  public minLength(min: number): StringValidator {
    if (min < 0) {
      throw new Error(`min length ${min} must be greater than or equal to 0`);
    }

    return new StringValidator({ ...this.options, minLength: min });
  }

  /**
   * Returns a new string validator that checks the string does not exceed the maximum length
   * @param max length that the string may not exceed
   */
  public maxLength(max: number): StringValidator {
    if (max < 0) {
      throw new Error(`max length ${max} must be greater than or equal to 0`);
    }

    return new StringValidator({ ...this.options, maxLength: max });
  }

  /**
   * Return a string validator that checks the string matches a given pattern.
   * @param pattern to check
   */
  public pattern(pattern: RegExp): StringValidator {
    return new StringValidator({ ...this.options, pattern });
  }

  /**
   * Return a string validator that checks the string is alphanumeric.
   */
  public alphanum(): StringValidator {
    return this.pattern(ALPHANUMERIC_REGEX);
  }

  /**
   * Return a string validator that checks the string is a uuid.
   */
  public uuid(): StringValidator {
    return this.pattern(UUID_REGEX);
  }

  /**
   * Return a string validator that checks the string is a valid e-mail.
   * The regular expression is based on https://stackoverflow.com/a/46181/1126380.
   */
  public email(): StringValidator {
    return this.pattern(EMAIL_REGEX);
  }

  public validate(
    value: any,
    path: ValidationErrorPath = []
  ): ValidationError[] {
    const { pattern, minLength, maxLength } = this.options;

    if (typeof value !== "string") {
      return [{ message: `must be a string`, path, value }];
    }

    const errors: ValidationError[] = [];

    if (pattern && !pattern.test(value)) {
      const message =
        SPECIAL_REGEX_MESSAGES[pattern.source] || "did not match pattern";

      errors.push({
        message,
        path,
        value,
      });
    }

    if (typeof minLength !== "undefined" && value.length < minLength) {
      errors.push({
        message: `length ${value.length} was shorter than minimum length: ${minLength}`,
        path,
        value,
      });
    }

    if (typeof maxLength !== "undefined" && value.length > maxLength) {
      errors.push({
        message: `length ${value.length} was longer than maximum length: ${maxLength}`,
        path,
        value,
      });
    }

    return errors;
  }

  isValid(value: any): value is string {
    const { maxLength, minLength, pattern } = this.options;
    return (
      typeof value === "string" &&
      (maxLength === undefined || value.length <= maxLength) &&
      (minLength === undefined || value.length >= minLength) &&
      (pattern === undefined || pattern.test(value))
    );
  }
}
