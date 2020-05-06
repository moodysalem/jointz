import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { describe, it } from "mocha";
import jointz, { Infer } from "../index";
import checkValidates from "../util/check-validates";

describe("jointz#object", () => {
  it("expects objects", () => {
    checkValidates(
      jointz.object({}),
      [],
      [{ message: "must be an object", path: [], value: [] }]
    );
    checkValidates(jointz.object({}), "abc", [
      { message: "must be an object", path: [], value: "abc" },
    ]);
    checkValidates(jointz.object({}), 123, [
      { message: "must be an object", path: [], value: 123 },
    ]);
  });

  it("allowUnknownKeys can be set to false to prevent unknown keys", () => {
    checkValidates(jointz.object({}).allowUnknownKeys(false), { abc: 123 }, [
      {
        message: 'encountered unknown key "abc"',
        path: [],
        value: { abc: 123 },
      },
    ]);
  });

  it("checks keys", () => {
    checkValidates(
      jointz.object({ abc: jointz.number() }).requiredKeys("abc"),
      {},
      [{ message: 'required key "abc" was not defined', path: [], value: {} }]
    );

    checkValidates(
      jointz.object({ abc: jointz.number() }).requiredKeys("abc"),
      { abc: "hello" },
      [{ message: "must be a number", path: ["abc"], value: "hello" }]
    );
  });

  it("works with nested objects", () => {
    const nested = jointz
      .object({
        abc: jointz.object({ def: jointz.number() }).requiredKeys("def"),
      })
      .requiredKeys("abc");

    checkValidates(nested, { abc: {} }, [
      {
        message: 'required key "def" was not defined',
        path: ["abc"],
        value: {},
      },
    ]);
    checkValidates(nested, { abc: { def: "string" } }, [
      { message: "must be a number", path: ["abc", "def"], value: "string" },
    ]);
  });

  describe("#allowUnknownKeys", () => {
    it("results in errors if unknown keys present", () => {
      checkValidates(jointz.object({}).allowUnknownKeys(false), { abc: 123 }, [
        {
          message: 'encountered unknown key "abc"',
          path: [],
          value: { abc: 123 },
        },
      ]);
    });
  });

  describe("#requiredKeys", () => {
    it("does not duplicate messages for duplicate required keys", () => {
      checkValidates(
        jointz.object({ abc: jointz.any() }).requiredKeys("abc"),
        {},
        [{ message: 'required key "abc" was not defined', path: [], value: {} }]
      );
    });
  });

  it("can have keys specified", () => {
    checkValidates(jointz.object({ abc: jointz.constant("def") }), {
      abc: "def",
    });

    checkValidates(
      jointz.object({ abc: jointz.constant("def") }),
      { abc: "red" },
      [{ message: 'must be one of "def"', path: ["abc"], value: "red" }]
    );
  });

  it("isValid typeguards properly", () => {
    const validator = jointz.object({ name: jointz.string() });

    const value: unknown = { name: "abc" };

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      expect(value.name).to.eq("abc");
    }
  });

  it("type extracted from object that allows unknown keys allows any other key", () => {
    const validator = jointz
      .object({ abc: jointz.constant("def") })
      .allowUnknownKeys(true);

    type validatorType = Infer<typeof validator>;

    const x: validatorType = { abc: "def", ghi: "fgh" };

    expect(x.ghi).to.eq("fgh");
  });

  it("isValid typeguards properly with nested objects", () => {
    const validator = jointz.object({
      abc: jointz.object({ def: jointz.array(jointz.number()) }),
    });

    const value: unknown = { abc: { def: [3] } };

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      expect(value!.abc!.def![0].toFixed(0)).to.eq("3");
    }
  });

  describe("type checks", () => {
    it("produces optional keys by default", () => {
      const validator = jointz.object({
        abc: jointz.number(),
      });

      assert<IsExact<Infer<typeof validator>, { abc?: number }>>(true);
    });

    it("produces required keys if specified", () => {
      const validator = jointz
        .object({
          abc: jointz.number(),
        })
        .requiredKeys("abc")
        .allowUnknownKeys(false);

      const x = {
        abc: 1,
        test: "test",
      };

      assert<IsExact<typeof x, Infer<typeof validator>>>(false);
    });

    it("allows unknown keys when unknown", () => {
      const validator = jointz
        .object({
          abc: jointz.number(),
        })
        .requiredKeys("abc")
        .allowUnknownKeys(true);

      assert<IsExact<keyof Infer<typeof validator>, string | number>>(true);
      assert<IsExact<Infer<typeof validator>["abc"], number>>(true);
    });

    it("does not allow unknown keys by default", () => {
      const validator = jointz
        .object({
          abc: jointz.number(),
          test: jointz.string(),
        })
        .requiredKeys("abc");

      assert<IsExact<keyof Infer<typeof validator>, string | number>>(false);
      assert<IsExact<keyof Infer<typeof validator>, "abc" | "test">>(true);
    });

    it("has the right shape", () => {
      const validator = jointz
        .object({
          abc: jointz
            .object({
              def: jointz.array(jointz.number()),
            })
            .requiredKeys("def"),
        })
        .requiredKeys("abc");

      assert<IsExact<Infer<typeof validator>, { abc: { def: number[] } }>>(
        true
      );
    });
  });
});
