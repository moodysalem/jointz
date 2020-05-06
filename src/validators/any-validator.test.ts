import { expect } from "chai";
import { assert, IsAny } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { Infer } from "../index";
import checkValidates from "../util/check-validates";

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
      checkValidates(jointz.any(), test);
    }
  });

  it("is the any type", () => {
    const validator = jointz.any();

    assert<IsAny<Infer<typeof validator>>>(true);
  });
});
