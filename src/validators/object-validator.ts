import {
  Infer,
  ValidationError,
  ValidationErrorPath,
  Validator,
} from "../interfaces";
import { spreadArgsToArray } from "../util/spread-args-to-array";

export interface Keys {
  [key: string]: Validator<unknown>;
}

export type ExtractObjectType<TKeys extends Keys> = {
  [K in keyof TKeys]: Infer<TKeys[K]>;
};

interface ObjectValidatorOptions<
  TKeys extends Keys,
  TRequiredKeys extends keyof TKeys,
  AllowUnknownKeys extends boolean | Validator<string>,
  TUnknownProperty extends unknown
> {
  readonly keys: TKeys;
  readonly requiredKeys: TRequiredKeys[];
  readonly allowUnknownKeys: AllowUnknownKeys;
  readonly unknownPropertyValidator?: Validator<TUnknownProperty>;
}

type AllowUnknownKeyObject<
  TObject extends {},
  AllowUnknownKeys extends boolean | Validator<string>,
  TUnknownProperty extends unknown
> = AllowUnknownKeys extends false
  ? TObject
  : TObject & { [key: string]: TUnknownProperty };

type WithRequiredKeys<
  TObject extends {},
  TRequiredKeys extends keyof TObject
> = {
  [K in keyof TObject]?: TObject[K];
} & {
  [K in keyof Pick<TObject, TRequiredKeys>]: TObject[K];
};

/**
 * Validator that checks a value is an object where each key has a value that matches a given validator.
 */
export default class ObjectValidator<
  TKeys extends Keys,
  TRequiredKeys extends keyof TKeys,
  TAllowUnknown extends boolean | Validator<string>,
  TUnknownProperty extends unknown
> extends Validator<
  AllowUnknownKeyObject<
    WithRequiredKeys<ExtractObjectType<TKeys>, TRequiredKeys>,
    TAllowUnknown,
    TUnknownProperty
  >
> {
  private readonly options: ObjectValidatorOptions<
    TKeys,
    TRequiredKeys,
    TAllowUnknown,
    TUnknownProperty
  >;

  public constructor(
    options: ObjectValidatorOptions<
      TKeys,
      TRequiredKeys,
      TAllowUnknown,
      TUnknownProperty
    >
  ) {
    super();
    this.options = options;
  }

  /**
   * Specify which keys are required for the object to be valid. Replaces any of the existing required keys. By default
   * no keys are required.
   *
   * @param requiredKeys keys that must be present for the object to be valid
   */
  public requiredKeys<T extends (keyof TKeys)[]>(
    ...requiredKeys: T | [T]
  ): ObjectValidator<TKeys, T[number], TAllowUnknown, TUnknownProperty> {
    return new ObjectValidator({
      ...this.options,
      requiredKeys: spreadArgsToArray(requiredKeys),
    });
  }

  /**
   * Change the behavior of the object validator to allow or disallow keys to be present in the object that are not
   * specified. By default unknown keys are allowed.
   *
   * @param allowUnknownKeys whether to allow keys that are not specified in the object validator to be present
   * @param unknownPropertyValidator validator that is applied to the value of any unknown key
   */
  public allowUnknownKeys<
    TAllow extends boolean | Validator<string>,
    TUnknownProperty extends unknown
  >(
    allowUnknownKeys: TAllow,
    unknownPropertyValidator?: Validator<TUnknownProperty>
  ): ObjectValidator<TKeys, TRequiredKeys, TAllow, TUnknownProperty> {
    return new ObjectValidator({
      ...this.options,
      allowUnknownKeys,
      unknownPropertyValidator,
    });
  }

  public validate(
    value: unknown,
    path: ValidationErrorPath = []
  ): ValidationError[] {
    const { requiredKeys, keys, allowUnknownKeys, unknownPropertyValidator } =
      this.options;

    if (typeof value !== "object" || Array.isArray(value) || value === null) {
      return [{ message: `must be an object`, path, value }];
    }

    let errors: ValidationError[] = [];

    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        if (keys && keys[key] !== undefined) {
          errors = errors.concat(
            keys[key].validate((value as any)[key], [
              ...path,
              key,
            ] as ValidationErrorPath)
          );
        } else {
          if (!allowUnknownKeys) {
            errors.push({
              message: `encountered unknown key "${key}"`,
              path,
              value,
            });
          } else {
            if (typeof allowUnknownKeys !== "boolean") {
              errors.push(
                ...allowUnknownKeys.validate(key, path).map((error) => ({
                  ...error,
                  message: `key "${key}" failed validation: ${error.message}`,
                }))
              );
            }
            if (unknownPropertyValidator) {
              errors.push(
                ...unknownPropertyValidator.validate(
                  (value as any)[key] as any,
                  [...path, key]
                )
              );
            }
          }
        }
      }
    }

    if (requiredKeys) {
      for (const requiredKey of requiredKeys) {
        if (!value.hasOwnProperty(requiredKey)) {
          errors.push({
            message: `required key "${String(requiredKey)}" was not defined`,
            path,
            value,
          });
        }
      }
    }

    return errors;
  }

  isValid(
    value: unknown
  ): value is AllowUnknownKeyObject<
    WithRequiredKeys<ExtractObjectType<TKeys>, TRequiredKeys>,
    TAllowUnknown,
    TUnknownProperty
  > {
    const { allowUnknownKeys, keys, requiredKeys, unknownPropertyValidator } =
      this.options;

    if (typeof value !== "object" || Array.isArray(value) || value === null) {
      return false;
    }

    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        if (keys && keys[key] !== undefined) {
          if (!keys[key].isValid((value as any)[key])) {
            return false;
          }
        } else {
          if (!allowUnknownKeys) {
            return false;
          } else if (
            typeof allowUnknownKeys !== "boolean" &&
            !allowUnknownKeys.isValid(key)
          ) {
            return false;
          } else if (
            unknownPropertyValidator &&
            !unknownPropertyValidator.isValid((value as any)[key])
          ) {
            return false;
          }
        }
      }
    }

    if (requiredKeys) {
      for (const requiredKey of requiredKeys) {
        if (!value.hasOwnProperty(requiredKey)) {
          return false;
        }
      }
    }

    return true;
  }
}
