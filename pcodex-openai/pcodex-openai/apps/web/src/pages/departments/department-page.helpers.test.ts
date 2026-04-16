import { describe, expect, it } from "vitest";
import {
  buildDepartmentEditDraft,
  buildDepartmentUpdatePayload,
  type EditableDepartmentRow,
} from "./department-page.helpers";

function createDepartment(overrides?: Partial<EditableDepartmentRow>): EditableDepartmentRow {
  return {
    id: "dept-1",
    code: "rd-center",
    name: "研发中心",
    parentId: null,
    sortOrder: 1,
    ...overrides,
  };
}

describe("department page helpers", () => {
  it("builds an edit draft from the department row", () => {
    expect(buildDepartmentEditDraft(createDepartment())).toEqual({
      name: "研发中心",
      parentId: "",
      sortOrder: 1,
    });
  });

  it("returns an update payload when department profile changed", () => {
    expect(
      buildDepartmentUpdatePayload(createDepartment(), {
        name: "研发平台中心",
        parentId: "dept-root",
        sortOrder: 8,
      }),
    ).toEqual({
      name: "研发平台中心",
      parentId: "dept-root",
      sortOrder: 8,
    });
  });

  it("returns null when department draft matches original data", () => {
    expect(
      buildDepartmentUpdatePayload(createDepartment(), {
        name: "研发中心",
        parentId: "",
        sortOrder: 1,
      }),
    ).toBeNull();
  });
});
