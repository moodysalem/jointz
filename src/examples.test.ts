import { expect } from "chai";
import { assert, Has, IsExact } from "conditional-type-checks";
import jointz, { Infer, Validator } from "./index";

const ThingValidator = jointz
  .object({
    id: jointz.string().uuid(),
    name: jointz.string().minLength(3).maxLength(100),
  })
  .requiredKeys(["id", "name"]);

type Thing = Infer<typeof ThingValidator>;

const myObject: unknown = { id: "abc", name: "hello world!" };

describe("examples", () => {
  it("#validate", () => {
    const errors = ThingValidator.validate(myObject); // expect an error because id is not a uuid

    if (errors.length) {
      // Fail
    } else {
      // Continue
      expect.fail();
    }
  });

  it("checkValid", () => {
    let failedValidation: boolean = false;
    try {
      const thing: Thing = ThingValidator.checkValid(myObject);
    } catch (validationError: any) {
      expect(validationError.isFailedValidationError).to.eq(true);
      failedValidation = true;
    }
    expect(failedValidation).to.eq(true);
  });

  it("indexer is id or name if allow unknown keys is false", () => {
    const falseAllow = ThingValidator.allowUnknownKeys(false);
    assert<IsExact<keyof Infer<typeof falseAllow>, "id" | "name">>(true);
  });

  it("isValid typeguards", () => {
    if (ThingValidator.isValid(myObject)) {
      // This works because myObject is a valid Thing
      const id: string = myObject.id;

      expect.fail(); // It's not actually valid
    }
  });

  it("isValid with unknown property typeguards", () => {
    if (
      ThingValidator.allowUnknownKeys({
        key: jointz.string(),
        value: jointz
          .object({ otherType: jointz.number(), notRequired: jointz.string() })
          .requiredKeys("otherType"),
      }).isValid(myObject)
    ) {
      // This works because myObject is a valid Thing
      const id: string = myObject.id;

      const other: number = myObject.otherKey.otherType;

      const notRequird: string | undefined = myObject.otherKey2.notRequired;

      expect.fail(); // It's not actually valid
    }
  });
});
