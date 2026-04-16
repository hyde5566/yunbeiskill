export interface EditableUserRow {
  id: string;
  account: string;
  name: string;
  status: string;
  department: { id: string; name: string };
  roles: Array<{ id: string; name: string }>;
}

export interface UserEditDraft {
  name: string;
  departmentId: string;
  roleIds: string[];
}

function haveSameIds(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return leftSorted.every((value, index) => value === rightSorted[index]);
}

export function buildUserEditDraft(user: EditableUserRow): UserEditDraft {
  return {
    name: user.name,
    departmentId: user.department.id,
    roleIds: user.roles.map((role) => role.id),
  };
}

export function buildUserMutations(user: EditableUserRow, draft: UserEditDraft) {
  const profilePayload =
    user.name !== draft.name || user.department.id !== draft.departmentId
      ? {
          name: draft.name,
          departmentId: draft.departmentId,
        }
      : null;

  const rolePayload = haveSameIds(
    user.roles.map((role) => role.id),
    draft.roleIds,
  )
    ? null
    : {
        roleIds: draft.roleIds,
      };

  return {
    profilePayload,
    rolePayload,
  };
}
