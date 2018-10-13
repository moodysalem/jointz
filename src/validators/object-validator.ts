import { ValidationError, Validator } from '../interfaces';

export interface Keys {
  [ key: string ]: Validator
}

interface ObjectValidatorOptions {
  readonly keys?: Keys;
  readonly requiredKeys?: string[];
  readonly allowUnknownKeys?: boolean;
}

export default class ObjectValidator implements Validator {
  private readonly options: ObjectValidatorOptions;

  public constructor(options: ObjectValidatorOptions) {
    this.options = options;
  }

  public requiredKeys(requiredKeys: string[]): ObjectValidator {
    return new ObjectValidator({ ...this.options, requiredKeys });
  }

  public keys(keys: Keys): ObjectValidator {
    return new ObjectValidator({ ...this.options, keys });
  }

  public allowUnknownKeys(allowUnknownKeys: boolean): ObjectValidator {
    return new ObjectValidator({ ...this.options, allowUnknownKeys });
  }

  validate(value: any, path: string = ''): ValidationError[] {
    const { requiredKeys, keys, allowUnknownKeys } = this.options;

    if (typeof value !== 'object' || Array.isArray(value)) {
      return [ { message: `not an object`, path, value } ];
    }

    let errors: ValidationError[] = [];

    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        if (keys && keys[ key ]) {
          errors = errors.concat(keys[ key ].validate(value[ key ], `${path}.${key}`));
        } else if (!allowUnknownKeys) {
          errors.push({ message: `encountered unknown key "${key}"`, path });
        }
      }
    }

    if (requiredKeys) {
      for (let i in requiredKeys) {
        const requiredKey = requiredKeys[ i ];
        if (typeof value[ requiredKey ] === 'undefined') {
          errors.push({ message: `required key "${requiredKey}" was not defined`, path });
        }
      }
    }

    return errors;
  }
}