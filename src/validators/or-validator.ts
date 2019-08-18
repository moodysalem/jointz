import { ValidationError, ValidationErrorPath, Validator } from '../interfaces';

interface OrValidatorOptions {
  // The list of validators of which any one validator must pass for the value to be considered valid
  readonly validators: Validator<any>[];
}

/**
 * Return a validator that passes if any of the validations succeed.
 */
export default class OrValidator<TOptions> extends Validator<TOptions> {
  private readonly options: OrValidatorOptions;

  public constructor(options: OrValidatorOptions) {
    super();
    this.options = options;
  }

  public validate(value: any, path: ValidationErrorPath = []): ValidationError[] {
    const { validators } = this.options;

    for (let i in validators) {
      const errs = validators[ i ].validate(value, path);

      if (errs.length === 0) {
        return [];
      }
    }

    return [ { path, message: 'did not match any of the expected types', value } ];
  }
}