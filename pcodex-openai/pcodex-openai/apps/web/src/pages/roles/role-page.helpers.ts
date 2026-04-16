export interface EditableRoleRow {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: string;
  permissionCodes: string[];
}

export interface RoleEditDraft {
  name: string;
  description: string;
  permissionCodes: string[];
}

function haveSameCodes(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return leftSorted.every((value, index) => value === rightSorted[index]);
}

export function buildRoleEditDraft(role: EditableRoleRow): RoleEditDraft {
  return {
    name: role.name,
    description: role.description ?? "",
    permissionCodes: [...role.permissionCodes],
  };
}

export function buildRoleUpdatePayload(role: EditableRoleRow, draft: RoleEditDraft) {
  const normalizedDescription = role.description ?? "";
  const changed =
    role.name !== draft.name ||
    normalizedDescription !== draft.description ||
    !haveSameCodes(role.permissionCodes, draft.permissionCodes);

  if (!changed) {
    return null;
  }

  return {
    name: draft.name,
    description: draft.description,
    permissionCodes: draft.permissionCodes,
  };
}
