import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";
import { JSONSchema7 } from "json-schema";

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

  public validate(
    value: any,
    path: ValidationErrorPath = []
  ): ValidationError[] {
    const { validators } = this.options;

    for (let i in validators) {
      const errs = validators[i].validate(value, path);

      if (errs.length === 0) {
        return [];
      }
    }

    return [
      { path, message: "did not match any of the expected types", value },
    ];
  }

  isValid(value: any): value is TOptions {
    const { validators } = this.options;
    for (let v of validators) {
      if (v.isValid(value)) {
        return true;
      }
    }
    return false;
  }

  _toJsonSchema(): JSONSchema7 {
    return {
      anyOf: this.options.validators.map((v) => v.toJsonSchema()),
    };
  }
}
