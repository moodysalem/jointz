import {
  FailedValidationError,
  ValidationError,
  ValidationErrorPath,
  Validator,
} from "../interfaces";
import { expect } from "chai";

export default function checkValidates(
  validator: Validator<any>,
  value: any,
  expectedError?: ValidationError[],
  path?: ValidationErrorPath
) {
  const expectedValid: boolean =
    typeof expectedError === "undefined" || expectedError.length === 0;

  expect(validator.validate(value, path)).to.deep.eq(
    expectedValid ? [] : expectedError,
    "#validate"
  );

  if (path !== undefined) {
    return;
  }

  expect(validator.isValid(value)).to.eq(expectedValid);

  const checkValid = () => validator.checkValid(value);
  if (expectedValid) {
    expect(checkValid).to.not.throw();
  } else {
    const errorMatcher = expect(checkValid).to.throw();
    errorMatcher.with.property("isFailedValidationError").eq(true);
    errorMatcher.with.property("errors").deep.eq(expectedError);
  }

  if (expectedError && expectedError.length > 0) {
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
