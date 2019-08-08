import { ExtractResultType, ValidationError, Validator } from '../interfaces';
import { SpreadArgs, spreadArgsToArray } from '../util/spread-args-to-array';
import uniqueString from '../util/unique-string';

export interface Keys {
  [ key: string ]: Validator<any>;
}

export type ExtractObjectType<TKeys extends Keys> = {
  [K in keyof TKeys]: ExtractResultType<TKeys[K]>;
};

interface ObjectValidatorOptions {
  readonly keys?: Keys;
  readonly requiredKeys?: string[];
  readonly allowUnknownKeys?: boolean;
}

export default class ObjectValidator<TObject extends {}> extends Validator<TObject> {
  private readonly options: ObjectValidatorOptions;

  public constructor(options: ObjectValidatorOptions) {
    super();
    this.options = options;
  }

  /**
   * Specify which keys are required for the object to be valid. Replaces any of the existing required keys.
   * @param requiredKeys keys that must be present for the object to be valid
   */
  public requiredKeys(...requiredKeys: SpreadArgs<string>): ObjectValidator<TObject> {
    return new ObjectValidator({ ...this.options, requiredKeys: uniqueString(spreadArgsToArray(requiredKeys)) });
  }

  /**
   * Redefine the key values of the object
   * @param keys the key validation spec
   */
  public keys<TKeys extends Keys>(keys: TKeys): ObjectValidator<ExtractObjectType<TKeys>> {
    return new ObjectValidator({ ...this.options, keys });
  }

  /**
   * Concatenate the given keys with the current keys to create a new validator
   * @param keys to add to the current validator
   */
  public concat(keys: Keys): ObjectValidator<TObject> {
    return new ObjectValidator({ ...this.options, keys: { ...this.options.keys, ...keys } });
  }

  /**
   * Merge two object validators by merging the required keys lists and all the key types. The given object validator
   * replaces this one.
   * @param objectValidator validator to merge with
   */
  public merge<TOther>(objectValidator: ObjectValidator<TOther>): ObjectValidator<TObject & TOther> {
    return new ObjectValidator({
      ...this.options,
      keys: { ...this.options.keys, ...objectValidator.options.keys },
      requiredKeys: uniqueString((this.options.requiredKeys || []).concat(objectValidator.options.requiredKeys || []))
    });
  }

  /**
   * Indicate that the object validator will allow keys to be present in the object that are not specified. Defaults to
   * false.
   * @param allowUnknownKeys whether to allow keys that are not specified in the object validator to be present
   */
  public allowUnknownKeys(allowUnknownKeys: boolean): ObjectValidator<TObject> {
    return new ObjectValidator({ ...this.options, allowUnknownKeys });
  }

  public validate(value: any, path: string = ''): ValidationError[] {
    const { requiredKeys, keys, allowUnknownKeys } = this.options;

    if (typeof value !== 'object' || Array.isArray(value)) {
      return [ { message: `must be an object`, path, value } ];
    }

    let errors: ValidationError[] = [];

    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        if (keys && typeof keys[ key ] !== 'undefined') {
          errors = errors.concat(keys[ key ].validate(value[ key ], `${path}.${key}`));
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