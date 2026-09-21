import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("M17 server container inventory", () => {
  it("copies the runtime universe catalog", () => {
    expect(readFileSync("Dockerfile", "utf8")).toMatch(/^COPY universe-catalog universe-catalog$/m);
  });
});
