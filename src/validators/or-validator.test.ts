import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { Infer } from "../index";
import checkValidates from "../util/check-validates";

describe("jointz#or", () => {
  it("validates one or the other", () => {
    checkValidates(jointz.or(jointz.string(), jointz.number()), {}, [
      {
        message: "did not match any of the expected types",
        path: [],
        value: {},
      },
    ]);
    checkValidates(jointz.or(jointz.string(), jointz.number()), "abc", []);
    checkValidates(jointz.or(jointz.string(), jointz.number()), 123, []);

    checkValidates(
      jointz.or(jointz.string(), jointz.number()),
      {},
      [
        {
          message: "did not match any of the expected types",
          path: ["abc"],
          value: {},
        },
      ],
      ["abc"]
    );
  });

  it("accepts an array", () => {
    checkValidates(jointz.or([jointz.string(), jointz.number()]), "abc", []);

    checkValidates(jointz.or([jointz.string(), jointz.number()]), 1, []);
  });

  it("isValid typeguards properly", () => {
    const aValidator = jointz
      .object({
        discriminator: jointz.constant("a"),
        num: jointz.number(),
      })
      .requiredKeys("discriminator", "num");

    type AType = Infer<typeof aValidator>;

    const bValidator = jointz
      .object({
        discriminator: jointz.constant("b"),
        str: jointz.string(),
      })
      .requiredKeys("discriminator", "str");

    const aOrB = jointz.or(aValidator, bValidator);

    assert<
      IsExact<Infer<typeof aValidator>, { discriminator: "a"; num: number }>
    >(true);
    assert<
      IsExact<Infer<typeof bValidator>, { discriminator: "b"; str: string }>
    >(true);
    assert<
      IsExact<
        Infer<typeof aOrB>,
        | { discriminator: "a"; num: number }
        | { discriminator: "b"; str: string }
      >
    >(true);

    expect(
      <unknown>[
        { discriminator: "a", num: 3 },
        { discriminator: "b", str: "test" },
        3,
        "test",
        "a",
        "b",
      ]
        .filter((x) => aOrB.isValid(x))
        .map((x) => aOrB.checkValid(x))
        .map((x) => {
          if (x.discriminator === "a") {
            return x.num;
          } else if (x.discriminator === "b") {
            return x.str;
          } else {
            throw new Error("unexpected code path");
          }
        })
    ).to.deep.eq([3, "test"]);
  });

  it("has the right type", () => {
    const validator = jointz.or(
      jointz.number(),
      jointz.string(),
      jointz.tuple(jointz.string(), jointz.number())
    );

    assert<
      IsExact<Infer<typeof validator>, number | string | [string, number]>
    >(true);
  });
});
