import { ExtractResultType, ValidationError, ValidationErrorPath, Validator } from '../interfaces';
import { spreadArgsToArray } from '../util/spread-args-to-array';

export interface Keys {
  [ key: string ]: Validator<any>;
}

export type ExtractObjectType<TKeys extends Keys> = {
  [K in keyof TKeys]: ExtractResultType<TKeys[K]>;
};

interface ObjectValidatorOptions<TKeys extends Keys, TRequiredKeys extends keyof TKeys, AllowUnknownKeys extends boolean> {
  readonly keys: TKeys;
  readonly requiredKeys: TRequiredKeys[];
  readonly allowUnknownKeys: AllowUnknownKeys;
}

type AllowUnknownKeyObject<TObject extends {}, AllowUnknownKeys extends boolean> = AllowUnknownKeys extends true ? TObject & { [ key: string ]: any; } : TObject;

type WithRequiredKeys<TObject extends {}, TRequiredKeys extends keyof TObject> = {
  [K in keyof TObject]?: TObject[K];
} & {
  [K in keyof Pick<TObject, TRequiredKeys>]: TObject[K];
}

/**
 * Validator that checks a value is an object where each key has a value that matches a given validator.
 */
export default class ObjectValidator<TKeys extends Keys, TRequiredKeys extends keyof TKeys, TAllowUnknown extends boolean>
  extends Validator<AllowUnknownKeyObject<WithRequiredKeys<ExtractObjectType<TKeys>, TRequiredKeys>, TAllowUnknown>> {
  private readonly options: ObjectValidatorOptions<TKeys, TRequiredKeys, TAllowUnknown>;

  public constructor(options: ObjectValidatorOptions<TKeys, TRequiredKeys, TAllowUnknown>) {
    super();
    this.options = options;
  }

  /**
   * Specify which keys are required for the object to be valid. Replaces any of the existing required keys. By default
   * no keys are required.
   *
   * @param requiredKeys keys that must be present for the object to be valid
   */
  public requiredKeys<T extends (keyof TKeys)[]>(...requiredKeys: T | [ T ]): ObjectValidator<TKeys, T[number], TAllowUnknown> {
    return new ObjectValidator({ ...this.options, requiredKeys: spreadArgsToArray(requiredKeys) });
  }

  /**
   * Change the behavior of the object validator to allow or disallow keys to be present in the object that are not
   * specified. By default unknown keys are allowed.
   *
   * @param allowUnknownKeys whether to allow keys that are not specified in the object validator to be present
   */
  public allowUnknownKeys<TAllow extends boolean>(allowUnknownKeys: TAllow): ObjectValidator<TKeys, TRequiredKeys, TAllow> {
    return new ObjectValidator({ ...this.options, allowUnknownKeys });
  }

  public validate(value: any, path: ValidationErrorPath = []): ValidationError[] {
    const { requiredKeys, keys, allowUnknownKeys } = this.options;

    if (typeof value !== 'object' || Array.isArray(value)) {
      return [ { message: `must be an object`, path, value } ];
    }

    let errors: ValidationError[] = [];

    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        if (keys && typeof keys[ key ] !== 'undefined') {
          errors = errors.concat(keys[ key ].validate(value[ key ], [ ...path, key ] as ValidationErrorPath));
        } else if (!allowUnknownKeys) {
          errors.push({ message: `encountered unknown key "${key}"`, path, value });
        }
      }
    }

    if (requiredKeys) {
      for (let i in requiredKeys) {
        const requiredKey = requiredKeys[ i ];
        if (typeof value[ requiredKey ] === 'undefined') {
          errors.push({ message: `required key "${requiredKey}" was not defined`, path, value });
        }
      }
    }

    return errors;
  }
}