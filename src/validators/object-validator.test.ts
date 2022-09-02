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

  it("more restricted type for allow unknown key", () => {
    checkValidates(
      jointz.object({}).allowUnknownKeys({
        key: jointz.constant("abc", "def", "ghi", "1"),
        value: jointz.any(),
      }),
      { 1: 2, def: "test" }
    );
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

  it("allowUnknownKeys can be set to a object with validators to force keys to match a pattern", () => {
    checkValidates(
      jointz
        .object({})
        .allowUnknownKeys({ key: jointz.constant("abc"), value: jointz.any() }),
      {
        abc: 123,
      }
    );

    checkValidates(
      jointz
        .object({})
        .allowUnknownKeys({ key: jointz.constant("def"), value: jointz.any() }),
      {
        abc: 123,
      },
      [
        {
          message: 'key "abc" failed validation: must be one of "def"',
          path: [],
          value: "abc",
        },
      ]
    );

    checkValidates(
      jointz.object({}).allowUnknownKeys({
        key: jointz.string().minLength(5),
        value: jointz.number(),
      }),
      {
        abc: 123,
        defghi: 567,
      },
      [
        {
          message:
            'key "abc" failed validation: length 3 was shorter than minimum length: 5',
          path: [],
          value: "abc",
        },
      ]
    );

    checkValidates(
      jointz.object({}).allowUnknownKeys({
        key: jointz.string().minLength(5),
        value: jointz.number().max(5),
      }),
      {
        abc: 123,
        defghi: 2,
      },
      [
        {
          message:
            'key "abc" failed validation: length 3 was shorter than minimum length: 5',
          path: [],
          value: "abc",
        },
        {
          message:
            'value for key "abc" failed validation: 123 must be less than or equal to 5',
          path: ["abc"],
          value: 123,
        },
      ]
    );
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
    it("no errors if allowUnknown keys is true", () => {
      checkValidates(jointz.object({}).allowUnknownKeys(true), { abc: 123 });
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
    it("does not error if key is found", () => {
      checkValidates(
        jointz
          .object({ abc: jointz.any() })
          .requiredKeys("abc")
          .allowUnknownKeys(true),
        { abc: 123 }
      );
    });
    it("does not error if key is found but allow unknown keys is false", () => {
      checkValidates(
        jointz
          .object({ abc: jointz.any() })
          .requiredKeys("abc")
          .allowUnknownKeys(false),
        { abc: 123 }
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

    describe("#omit", () => {
      it("removes the keys", () => {
        const validator = jointz
          .object({
            abc: jointz.number(),
            test: jointz.string(),
          })
          .requiredKeys("abc");

        const omitAbc = validator.omit("abc");
        const omitTest = validator.omit("test");

        assert<IsExact<keyof Infer<typeof omitAbc>, "test">>(true);
        assert<IsExact<keyof Infer<typeof omitAbc>, "abc">>(false);
        assert<IsExact<keyof Infer<typeof omitTest>, "abc">>(true);
        assert<IsExact<keyof Infer<typeof omitTest>, "test">>(false);
      });
      it("only checks for the keys", () => {
        const validator = jointz
          .object({
            abc: jointz.number(),
            test: jointz.string(),
          })
          .requiredKeys("abc");

        const omitAbc = validator.omit("abc");
        const omitTest = validator.omit("test");

        checkValidates(omitAbc, {});
        checkValidates(omitAbc, { test: "not-abc" });
        checkValidates(omitAbc, { test: "not-abc", abc: 5 }, [
          {
            path: [],
            message: 'encountered unknown key "abc"',
            value: { abc: 5, test: "not-abc" },
          },
        ]);
        checkValidates(omitTest, { abc: 5 });
        checkValidates(omitTest, { abc: 5, test: "string" }, [
          {
            path: [],
            message: 'encountered unknown key "test"',
            value: { abc: 5, test: "string" },
          },
        ]);
      });
    });

    describe("#pick", () => {
      it("selects the keys", () => {
        const validator = jointz
          .object({
            abc: jointz.number(),
            test: jointz.string(),
          })
          .requiredKeys("abc");

        const pickAbc = validator.pick("abc");
        const pickTest = validator.pick("test");

        assert<IsExact<keyof Infer<typeof pickAbc>, "test">>(false);
        assert<IsExact<keyof Infer<typeof pickAbc>, "abc">>(true);
        assert<IsExact<keyof Infer<typeof pickTest>, "abc">>(false);
        assert<IsExact<keyof Infer<typeof pickTest>, "test">>(true);
      });
      it("only checks for the selected keys", () => {
        const validator = jointz
          .object({
            abc: jointz.number(),
            test: jointz.string(),
          })
          .requiredKeys("abc");

        const pickAbc = validator.pick("abc");
        const pickTest = validator.pick("test");

        checkValidates(pickAbc, {}, [
          {
            message: 'required key "abc" was not defined',
            path: [],
            value: {},
          },
        ]);
        checkValidates(pickAbc, { test: "not-abc" }, [
          {
            message: 'encountered unknown key "test"',
            path: [],
            value: { test: "not-abc" },
          },
          {
            message: 'required key "abc" was not defined',
            path: [],
            value: { test: "not-abc" },
          },
        ]);
        checkValidates(pickAbc, { test: "not-abc", abc: 5 }, [
          {
            path: [],
            message: 'encountered unknown key "test"',
            value: { abc: 5, test: "not-abc" },
          },
        ]);
        checkValidates(pickTest, { abc: 5 }, [
          {
            message: 'encountered unknown key "abc"',
            path: [],
            value: { abc: 5 },
          },
        ]);
        checkValidates(pickTest, { abc: 5, test: "string" }, [
          {
            path: [],
            message: 'encountered unknown key "abc"',
            value: { abc: 5, test: "string" },
          },
        ]);
      });
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

      assert<
        IsExact<
          Infer<typeof validator>,
          {
            abc: { def: number[] };
          }
        >
      >(true);
    });
  });
});
