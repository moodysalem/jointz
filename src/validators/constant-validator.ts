import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";
import { JSONSchema7 } from "json-schema";

export type AllowedValueTypes = string | number | boolean | null;

const SUPPORTED_VALUE_TYPEOF: readonly string[] = [
  "string",
  "number",
  "boolean",
];

/**
 * Return true if the given value is one of the supported value types
 * @param value to check
 */
function isSupportedValueType(value: any): value is AllowedValueTypes {
  return value === null || SUPPORTED_VALUE_TYPEOF.indexOf(typeof value) !== -1;
}

interface ConstantValidatorOptions<TValues extends Array<AllowedValueTypes>> {
  readonly allowedValues: TValues;
}

/**
 * Validator that checks that a value is one of a given set of constants
 */
export default class ConstantValidator<
  TValues extends Array<AllowedValueTypes>
> extends Validator<TValues[number]> {
  private readonly options: ConstantValidatorOptions<TValues>;

  public constructor(options: ConstantValidatorOptions<TValues>) {
    super();

    if (options.allowedValues.length === 0) {
      throw new Error("constant validators should have at least one value");
    }

    for (let value of options.allowedValues) {
      if (!isSupportedValueType(value)) {
        throw new Error(
          "unsupported value type in constant validator, must be string, boolean, number, null or undefined"
        );
      }
    }

    this.options = options;
  }

  public validate(
    value: any,
    path: ValidationErrorPath = []
  ): ValidationError[] {
    const { allowedValues } = this.options;

    if (allowedValues.indexOf(value) === -1) {
      return [
        {
          path,
          message: `must be one of ${this.options.allowedValues
            .map((v) => (typeof v === "string" ? `"${v}"` : `${v}`))
            .join(", ")}`,
          value,
        },
      ];
    }

    return [];
  }

  isValid(value: any): value is TValues[number] {
    return this.options.allowedValues.indexOf(value) !== -1;
  }

  _toJsonSchema(): JSONSchema7 {
    // todo: should we support enum here?
    return {
      anyOf: this.options.allowedValues.map((item) =>
        item === null ? { type: "null" } : { const: item }
      ),
    };
  }
}
