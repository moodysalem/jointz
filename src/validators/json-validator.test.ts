import { expect } from "chai";
import { describe, it } from "mocha";
import jointz, { Infer } from "../index";
import checkValidates from "../util/check-validates";

describe("jointz#json", () => {
  it("allows any json", () => {
    checkValidates(jointz.json(jointz.any()), '"abc"');
    checkValidates(jointz.json(jointz.any()), "{}");
    checkValidates(jointz.json(jointz.any()), "true");
    checkValidates(jointz.json(jointz.any()), "false");
    checkValidates(jointz.json(jointz.any()), "3.23");
  });

  it("throws for invalid json", () => {
    checkValidates(jointz.json(jointz.any()), '"ab', [
      { message: "invalid json", path: [], value: '"ab' },
    ]);
    checkValidates(jointz.json(jointz.any()), "{", [
      { message: "invalid json", path: [], value: "{" },
    ]);
    checkValidates(jointz.json(jointz.any()), "tru", [
      { message: "invalid json", path: [], value: "tru" },
    ]);
    checkValidates(jointz.json(jointz.any()), "fals", [
      { message: "invalid json", path: [], value: "fals" },
    ]);
  });

  it("checks for a particular type in the json", () => {
    checkValidates(jointz.json(jointz.boolean()), '""', [
      { path: [], message: "must be a boolean", value: "" },
    ]);
    checkValidates(jointz.json(jointz.boolean()), "{}", [
      { path: [], message: "must be a boolean", value: {} },
    ]);
    checkValidates(jointz.json(jointz.boolean()), "true");
    checkValidates(jointz.json(jointz.boolean()), "false");
  });

  it("isValid typeguards properly", () => {
    const validator = jointz.json(jointz.any());
    const value: unknown = '"abc"';

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      // substring only available on string type
      expect(value.substring(0, 1)).eq('"');
    }
  });
});
