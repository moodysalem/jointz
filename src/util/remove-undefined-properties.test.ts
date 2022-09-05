import { removeUndefinedProperties } from "./remove-undefined-properties";
import { expect } from "chai";

describe("#removeUndefinedProperties", () => {
  it("empty object", () => {
    expect(removeUndefinedProperties({})).to.deep.eq({});
  });

  it("one undefined property", () => {
    expect(removeUndefinedProperties({ type: undefined })).to.deep.eq({});
  });

  it("nested undefined property", () => {
    expect(
      removeUndefinedProperties({ type: "array", items: { type: undefined } })
    ).to.deep.eq({ type: "array", items: {} });
  });

  it("nested array undefined property", () => {
    expect(
      removeUndefinedProperties({ type: "array", items: [{ type: undefined }] })
    ).to.deep.eq({ type: "array", items: [{}] });
  });

  it("handles null correctly", () => {
    expect(
      removeUndefinedProperties({
        type: "array",
        items: [{ type: undefined, const: null, enum: [null] }],
      })
    ).to.deep.eq({ type: "array", items: [{ const: null, enum: [null] }] });
  });
});
