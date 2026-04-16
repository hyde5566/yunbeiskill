export interface MemberCandidate {
  id: string;
  account: string;
  name: string;
  status: string;
}

export interface ProjectMemberRow {
  userId: string;
  account: string;
  name: string;
}

export interface EditableProjectRow {
  id: string;
  name: string;
  description?: string;
  status: string;
  members: ProjectMemberRow[];
}

export interface ProjectEditDraft {
  name: string;
  description: string;
}

export function listAvailableProjectMembers(
  candidates: MemberCandidate[],
  members: ProjectMemberRow[],
) {
  const memberIds = new Set(members.map((member) => member.userId));
  return candidates.filter((candidate) => candidate.status === "ACTIVE" && !memberIds.has(candidate.id));
}

export function buildProjectEditDraft(project: EditableProjectRow): ProjectEditDraft {
  return {
    name: project.name,
    description: project.description ?? "",
  };
}

export function buildProjectUpdatePayload(project: EditableProjectRow, draft: ProjectEditDraft) {
  const normalizedDescription = project.description ?? "";
  if (project.name === draft.name && normalizedDescription === draft.description) {
    return null;
  }

  return {
    name: draft.name,
    description: draft.description,
  };
}
