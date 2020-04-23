import { expect } from "chai";
import { assert, IsAny } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { ExtractResultType } from "../index";

describe("jointz#any", () => {
  it("always returns true", () => {
    const anies: any[] = [
      "abc",
      1,
      -1,
      "",
      "43@!%()!%^*!#$^)_",
      null,
      undefined,
    ];
    for (let test of anies) {
      expect(jointz.any().validate(test)).to.deep.eq([]);
    }
  });

  it("is the any type", () => {
    const validator = jointz.any();

    assert<IsAny<ExtractResultType<typeof validator>>>(true);
  });
});
