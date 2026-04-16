import { describe, expect, it } from "vitest";
import { buildRoleEditDraft, buildRoleUpdatePayload, type EditableRoleRow } from "./role-page.helpers";

function createRole(overrides?: Partial<EditableRoleRow>): EditableRoleRow {
  return {
    id: "role-1",
    code: "reviewer",
    name: "审核员",
    description: "初始角色",
    status: "ACTIVE",
    permissionCodes: ["role.view", "project.view"],
    ...overrides,
  };
}

describe("role page helpers", () => {
  it("builds an edit draft from the current role row", () => {
    expect(buildRoleEditDraft(createRole())).toEqual({
      name: "审核员",
      description: "初始角色",
      permissionCodes: ["role.view", "project.view"],
    });
  });

  it("returns an update payload when role fields changed", () => {
    expect(
      buildRoleUpdatePayload(createRole(), {
        name: "高级审核员",
        description: "更新说明",
        permissionCodes: ["role.view", "project.edit"],
      }),
    ).toEqual({
      name: "高级审核员",
      description: "更新说明",
      permissionCodes: ["role.view", "project.edit"],
    });
  });

  it("returns null when the role edit draft matches the original row", () => {
    expect(
      buildRoleUpdatePayload(createRole(), {
        name: "审核员",
        description: "初始角色",
        permissionCodes: ["project.view", "role.view"],
      }),
    ).toBeNull();
  });
});
