import { describe, expect, it } from "vitest";
import { validateCharacterValues } from "@masterhost/worldpack-sdk";

const schema = { steps: [
  { id: "identity", title: "Identity", fields: [{ id: "handle", label: "Handle", type: "text" as const, required: true }] },
  { id: "role", title: "Role", fields: [{ id: "role", label: "Role", type: "choice" as const, required: true, options: [{ value: "runner", label: "Runner" }] }] }
] };

describe("server character values", () => {
  it("accepts values declared by a pack", () => expect(validateCharacterValues(schema, { handle: "Echo", role: "runner" })).toEqual({ handle: "Echo", role: "runner" }));
  it("rejects missing, unknown and invalid choices", () => {
    expect(() => validateCharacterValues(schema, { handle: "Echo" })).toThrow(/required.*role/);
    expect(() => validateCharacterValues(schema, { handle: "Echo", role: "warrior" })).toThrow(/invalid choice/);
    expect(() => validateCharacterValues(schema, { handle: "Echo", role: "runner", admin: true })).toThrow(/unknown character field/);
  });
});
