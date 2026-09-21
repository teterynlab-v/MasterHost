import { describe, expect, it } from "vitest";
import { gmWorkspaces, initialGmWorkspace } from "../apps/web/src/gm-workspace.js";

describe("M16 GM workspace", () => {
  it("opens a live game on the table", () => expect(initialGmWorkspace()).toBe("table"));
  it("keeps the approved task order", () => expect(gmWorkspaces).toEqual(["table", "checks", "encounter", "party", "journal"]));
});
