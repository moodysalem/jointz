import { ValidationError, Validator } from '../interfaces';

const ALPHANUMERIC_REGEX = /^[a-fA-F0-9]*$/;
const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

interface StringValidatorOptions {
  readonly pattern?: RegExp;
  readonly minLength?: number;
  readonly maxLength?: number;
}

export default class StringValidator implements Validator {
  private readonly options: StringValidatorOptions;

  public constructor(options: StringValidatorOptions) {
    this.options = options;
  }

  public minLength(min: number) {
    return new StringValidator({ ...this.options, minLength: min });
  }

  public maxLength(max: number) {
    return new StringValidator({ ...this.options, maxLength: max });
  }

  public pattern(pattern: RegExp) {
    return new StringValidator({ ...this.options, pattern });
  }

  public alphanum(): StringValidator {
    return new StringValidator({ ...this.options, pattern: ALPHANUMERIC_REGEX });
  }

  public uuid() {
    return new StringValidator({ ...this.options, pattern: UUID_REGEX });
  }

  validate(value: any, path: string = ''): ValidationError[] {
    const { pattern, minLength, maxLength } = this.options;

    if (typeof value !== 'string') {
      return [ { message: `not a string`, path, value } ];
    }

    const errors: ValidationError[] = [];

    if (pattern && !pattern.test(value)) {
      errors.push({
        message: pattern === ALPHANUMERIC_REGEX ?
          'must be alphanumeric' :
          (
            pattern === UUID_REGEX ?
              'must be a uuid' :
              'did not match pattern'
          ),
        path,
        value
      });
    }

    if (minLength && value.length < minLength) {
      errors.push({ message: `length ${value.length} was shorter than minimum length: ${minLength}`, path, value });
    }

    if (maxLength && value.length > maxLength) {
      errors.push({ message: `length ${value.length} was longer than maximum length: ${maxLength}`, path, value });
    }

    return errors;
  }
}