export interface EditableDepartmentRow {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
}

export interface DepartmentEditDraft {
  name: string;
  parentId: string;
  sortOrder: number;
}

export function buildDepartmentEditDraft(department: EditableDepartmentRow): DepartmentEditDraft {
  return {
    name: department.name,
    parentId: department.parentId ?? "",
    sortOrder: department.sortOrder,
  };
}

export function buildDepartmentUpdatePayload(
  department: EditableDepartmentRow,
  draft: DepartmentEditDraft,
) {
  const changed =
    department.name !== draft.name ||
    (department.parentId ?? "") !== draft.parentId ||
    department.sortOrder !== draft.sortOrder;

  if (!changed) {
    return null;
  }

  return {
    name: draft.name,
    parentId: draft.parentId || undefined,
    sortOrder: draft.sortOrder,
  };
}
