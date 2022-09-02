import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";
import { JSONSchema7 } from "json-schema";

type TupleValidators<T extends Array<unknown>> = {
  [K in keyof T]: Validator<T[K]>;
};

interface TupleValidatorOptions<TTuple extends Array<unknown>> {
  readonly validators: TupleValidators<TTuple>;
}

/**
 * Returns a validator that checks the value is a tuple, i.e. an array with a fixed number of elements that match the
 * given validators.
 */
export default class TupleValidator<
  TTuple extends Array<unknown>
> extends Validator<TTuple> {
  private readonly options: TupleValidatorOptions<TTuple>;

  public constructor(options: TupleValidatorOptions<TTuple>) {
    super();
    this.options = options;
  }

  public validate(
    value: unknown,
    path: ValidationErrorPath = []
  ): ValidationError[] {
    const { validators } = this.options;

    if (!Array.isArray(value)) {
      return [{ message: `must be an array`, path, value }];
    }

    let errors: ValidationError[] = [];

    for (let i = 0; i < validators.length; i++) {
      errors = errors.concat(validators[i].validate(value[i], [...path, i]));
    }

    if (value.length > validators.length) {
      errors.push({
        value,
        path,
        message: `array length ${value.length} was greater than expected length ${validators.length}`,
      });
    }

    return errors;
  }

  isValid(value: unknown): value is TTuple {
    const { validators } = this.options;
    if (typeof value !== "object" || !Array.isArray(value)) {
      return false;
    }
    if (value.length !== validators.length) {
      return false;
    }
    for (let i = 0; i < validators.length; i++) {
      if (!validators[i].isValid(value[i])) {
        return false;
      }
    }
    return true;
  }

  _toJsonSchema(): JSONSchema7 {
    return {
      type: "array",
      // this is not part of the json schema 7 type, but is part of the spec
      // https://json-schema.org/understanding-json-schema/reference/array.html?highlight=tuple#additional-items
      items: this.options.validators.map((v) => v.toJsonSchema()),
      additionalItems: false,
      minItems: this.options.validators.length,
      maxItems: this.options.validators.length,
    };
  }
}
