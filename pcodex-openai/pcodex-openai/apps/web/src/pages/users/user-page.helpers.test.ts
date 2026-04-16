import { describe, expect, it } from "vitest";
import {
  buildUserEditDraft,
  buildUserMutations,
  type EditableUserRow,
  type UserEditDraft,
} from "./user-page.helpers";

function createDraft(overrides?: Partial<UserEditDraft>): UserEditDraft {
  return {
    name: "张三",
    departmentId: "dept-1",
    roleIds: ["role-1"],
    ...overrides,
  };
}

function createUser(overrides?: Partial<EditableUserRow>): EditableUserRow {
  return {
    id: "user-1",
    account: "zhangsan",
    name: "张三",
    status: "ACTIVE",
    department: { id: "dept-1", name: "研发中心" },
    roles: [{ id: "role-1", name: "管理员" }],
    ...overrides,
  };
}

describe("user page helpers", () => {
  it("creates an editable draft from the user row", () => {
    const draft = buildUserEditDraft(
      createUser({
        roles: [
          { id: "role-1", name: "管理员" },
          { id: "role-2", name: "审核员" },
        ],
      }),
    );

    expect(draft).toEqual({
      name: "张三",
      departmentId: "dept-1",
      roleIds: ["role-1", "role-2"],
    });
  });

  it("separates profile updates from role reassignment changes", () => {
    const result = buildUserMutations(
      createUser(),
      createDraft({
        name: "张三 QA",
        departmentId: "dept-2",
        roleIds: ["role-2"],
      }),
    );

    expect(result.profilePayload).toEqual({
      name: "张三 QA",
      departmentId: "dept-2",
    });
    expect(result.rolePayload).toEqual({
      roleIds: ["role-2"],
    });
  });

  it("returns null payloads when nothing changed", () => {
    const result = buildUserMutations(createUser(), createDraft());

    expect(result.profilePayload).toBeNull();
    expect(result.rolePayload).toBeNull();
  });
});
