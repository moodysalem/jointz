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
  AllowUnknownKeys extends
    | boolean
    | { key: Validator<string>; value: Validator<any> }
> {
  readonly keys: TKeys;
  readonly requiredKeys: TRequiredKeys[];
  readonly allowUnknownKeys: AllowUnknownKeys;
}

type AllowUnknownKeyObject<
  TObject extends {},
  AllowUnknownKeys extends
    | boolean
    | { key: Validator<string>; value: Validator<any> }
> = AllowUnknownKeys extends { key: Validator<string>; value: Validator<any> }
  ? { [key: string]: Infer<AllowUnknownKeys["value"]> } & TObject
  : AllowUnknownKeys extends false
  ? TObject
  : TObject & { [key: string]: unknown };

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
  TAllowUnknown extends
    | boolean
    | { key: Validator<string>; value: Validator<any> }
> extends Validator<
  AllowUnknownKeyObject<
    WithRequiredKeys<ExtractObjectType<TKeys>, TRequiredKeys>,
    TAllowUnknown
  >
> {
  private readonly options: ObjectValidatorOptions<
    TKeys,
    TRequiredKeys,
    TAllowUnknown
  >;

  public constructor(
    options: ObjectValidatorOptions<TKeys, TRequiredKeys, TAllowUnknown>
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
  ): ObjectValidator<TKeys, T[number], TAllowUnknown> {
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
   * @param unknownPropertyValidator validator that is applied to the value of any unknown key that is set
   */
  public allowUnknownKeys<
    TAllow extends boolean | { key: Validator<string>; value: Validator<any> }
  >(allowUnknownKeys: TAllow): ObjectValidator<TKeys, TRequiredKeys, TAllow> {
    return new ObjectValidator({
      ...this.options,
      allowUnknownKeys,
    });
  }

  /**
   * Produce a new object validator by removing the specified keys from the current object validator, similar to TypeScript
   * Omit
   * @param omitted the keys to omit
   */
  public omit<TOmitted extends (keyof TKeys)[]>(
    ...omitted: TOmitted
  ): ObjectValidator<
    Omit<TKeys, TOmitted[number]>,
    Exclude<TRequiredKeys, TOmitted[number]>,
    TAllowUnknown
  > {
    const omittedMap = omitted.reduce<{
      [key in keyof TKeys]?: true;
    }>((memo, value) => {
      memo[value] = true;
      return memo;
    }, {});

    return new ObjectValidator({
      ...this.options,
      keys: {
        ...Object.fromEntries(
          Object.entries(this.options.keys).filter(([key]) => !omittedMap[key])
        ),
      },
      requiredKeys: this.options.requiredKeys.filter(
        (requiredKey) => !omittedMap[requiredKey]
      ) as any,
    }) as any;
  }

  /**
   * Produce a new object validator by selecting only the specified keys from the current set of keys, same as TypeScript Pick
   * @param selected the keys to select
   */
  public pick<TSelected extends (keyof TKeys)[]>(
    ...selected: TSelected
  ): ObjectValidator<
    Pick<TKeys, TSelected[number]>,
    TSelected[number],
    TAllowUnknown
  > {
    const selectedMap = selected.reduce<{
      [key in keyof TKeys]?: true;
    }>((memo, value) => {
      memo[value] = true;
      return memo;
    }, {});

    return new ObjectValidator({
      ...this.options,
      keys: {
        ...Object.fromEntries(
          Object.entries(this.options.keys).filter(([key]) => selectedMap[key])
        ),
      },
      requiredKeys: this.options.requiredKeys.filter(
        (requiredKey) => selectedMap[requiredKey]
      ) as any,
    }) as any;
  }

  /**
   * Add additional properties to the object validator
   * @param additionalKeys the additional keys to add
   */
  public extend<TMoreKeys extends Keys>(
    additionalKeys: TMoreKeys
  ): ObjectValidator<TKeys & TMoreKeys, TRequiredKeys, TAllowUnknown> {
    return new ObjectValidator({
      ...this.options,
      keys: {
        ...this.options.keys,
        ...additionalKeys,
      },
    });
  }

  public validate(
    value: unknown,
    path: ValidationErrorPath = []
  ): ValidationError[] {
    const { requiredKeys, keys, allowUnknownKeys } = this.options;

    if (typeof value !== "object" || Array.isArray(value) || value === null) {
      return [{ message: `must be an object`, path, value }];
    }

    let errors: ValidationError[] = [];

    for (const [key, keyValue] of Object.entries(value)) {
      if (value.hasOwnProperty(key)) {
        if (keys && keys[key] !== undefined) {
          errors = errors.concat(keys[key].validate(keyValue, [...path, key]));
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
                ...allowUnknownKeys.key.validate(key, path).map((error) => ({
                  ...error,
                  message: `key "${key}" failed validation: ${error.message}`,
                }))
              );
              errors.push(
                ...allowUnknownKeys.value
                  .validate(keyValue, [...path, key])
                  .map((error) => ({
                    ...error,
                    message: `value for key "${key}" failed validation: ${error.message}`,
                  }))
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

  public isValid(
    value: unknown
  ): value is AllowUnknownKeyObject<
    WithRequiredKeys<ExtractObjectType<TKeys>, TRequiredKeys>,
    TAllowUnknown
  > {
    const { allowUnknownKeys, keys, requiredKeys } = this.options;

    if (typeof value !== "object" || Array.isArray(value) || value === null) {
      return false;
    }

    for (const [key, keyValue] of Object.entries(value)) {
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
            (!allowUnknownKeys.key.isValid(key) ||
              !allowUnknownKeys.value.isValid(keyValue))
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
