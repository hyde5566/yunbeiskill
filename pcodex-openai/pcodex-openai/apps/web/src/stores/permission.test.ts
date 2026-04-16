import { describe, expect, it } from "vitest";
import { buildVisibleNavigation } from "./permission";

describe("permission store", () => {
  it("returns only authorized navigation items", () => {
    const items = buildVisibleNavigation(["dashboard.view", "user.view", "skill.download"]);
    expect(items.map((item) => item.key)).toEqual(["dashboard", "users", "skills"]);
  });
});
