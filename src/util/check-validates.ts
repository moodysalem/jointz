import { ValidationError, ValidationErrorPath, Validator } from "../interfaces";
import { expect } from "chai";

/**
 * Tests all the exposed functions of a validator, isValid, validate, and checkValid have consistent return values
 * @param validator the validator to check
 * @param value the value to validate
 * @param expectedError if invalid, these are the errors it should throw
 * @param path the path of the value being passed in
 */
export default function checkValidates(
  validator: Validator<unknown>,
  value: unknown,
  expectedError?: ValidationError[],
  path?: ValidationErrorPath
) {
  expect(validator.validate(value, path)).to.deep.eq(
    expectedError || [],
    "#validate"
  );

  if (path !== undefined) {
    return;
  }

  expect(validator.isValid(value)).to.eq(
    typeof expectedError === "undefined" || expectedError.length === 0
  );

  if (typeof expectedError === "undefined" || expectedError.length === 0) {
    expect(() => validator.checkValid(value)).to.not.throw();
    expect(() => validator.checkValid(value, [0, "abc", 1])).to.not.throw();
  } else {
    const errorMatcher = expect(() =>
      validator.checkValid(value, path)
    ).to.throw();
    const messageMatcher = errorMatcher.with.property("message");

    //  message must contain information about every message and path
    expectedError.forEach((err) => {
      messageMatcher.contains(err.message);
      messageMatcher.contains(err.path.join("."));
    });

    // must have the property that indicates it is a failed validation error
    errorMatcher.with.property("isFailedValidationError").eq(true);
    // must have the errors property that is equal to the validation errors
    errorMatcher.with.property("errors").deep.eq(expectedError);

    checkValidates(
      validator,
      value,
      expectedError.map((error) => ({
        ...error,
        path: [0, "abc", 1, ...error.path],
      })),
      [0, "abc", 1]
    );
  }
}
