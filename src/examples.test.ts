import { expect } from 'chai';
import jointz, { ExtractResultType } from './index';

const ThingValidator = jointz.object({
  id: jointz.string().uuid(),
  name: jointz.string().minLength(3).maxLength(100)
}).requiredKeys([ 'id', 'name' ]);

type Thing = ExtractResultType<typeof ThingValidator>;

const myObject: unknown = { id: 'abc', name: 'hello world!' };

describe('examples', () => {
  it('#validate', () => {
    const errors = ThingValidator.validate(myObject); // expect an error because id is not a uuid

    if (errors.length) {
      // Fail
    } else {
      // Continue
      expect.fail();
    }
  });

  it('checkValid', () => {
    let failedValidation: boolean = false;
    try {
      const thing: Thing = ThingValidator.checkValid(myObject);
    } catch (validationError) {
      expect(validationError.isFailedValidationError).to.eq(true);
      failedValidation = true;
    }
    expect(failedValidation).to.eq(true);
  });

  it('isValid typeguards', () => {
    if (ThingValidator.isValid(myObject)) {
      // This works because myObject is a valid Thing
      const id: string = myObject.id;

      expect.fail(); // It's not actually valid
    }
  });
});