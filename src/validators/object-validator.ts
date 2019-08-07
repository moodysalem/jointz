import { ValidationError, Validator } from '../interfaces';
import uniqueString from '../util/unique-string';

export interface Keys {
  [ key: string ]: Validator
}

interface ObjectValidatorOptions {
  readonly keys?: Keys;
  readonly requiredKeys?: string[];
  readonly allowUnknownKeys?: boolean;
}

export default class ObjectValidator<TObject> extends Validator<TObject> {
  private readonly options: ObjectValidatorOptions;

  public constructor(options: ObjectValidatorOptions) {
    super();
    this.options = options;
  }

  public requiredKeys(...requiredKeys: string[]): ObjectValidator<TObject> {
    return new ObjectValidator({ ...this.options, requiredKeys: uniqueString(requiredKeys) });
  }

  public keys(keys: Keys): ObjectValidator {
    return new ObjectValidator({ ...this.options, keys });
  }

  public concat(keys: Keys): ObjectValidator {
    return new ObjectValidator({ ...this.options, keys: { ...this.options.keys, ...keys } });
  }

  public merge(objectValidator: ObjectValidator) {
    return new ObjectValidator({
      ...this.options,
      keys: { ...this.options.keys, ...objectValidator.options.keys },
      requiredKeys: uniqueString((this.options.requiredKeys || []).concat(objectValidator.options.requiredKeys || []))
    });
  }

  public allowUnknownKeys(allowUnknownKeys: boolean): ObjectValidator {
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