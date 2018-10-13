import { ValidationError, Validator } from '../interfaces';

interface OrValidatorOptions {
  validators: Validator[]
}

export default class OrValidator implements Validator {
  private readonly options: OrValidatorOptions;

  public constructor(options: OrValidatorOptions) {
    this.options = options;
  }

  validate(value: any, path: string = ''): ValidationError[] {
    const { validators } = this.options;

    for (let i in validators) {
      const errs = validators[ i ].validate(value);

      if (errs.length === 0) {
        return [];
      }
    }

    return [ { path, message: 'did not validate with any option', value } ];
  }
}