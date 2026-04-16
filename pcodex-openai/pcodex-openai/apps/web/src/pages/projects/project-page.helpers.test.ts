import { describe, expect, it } from "vitest";
import {
  buildProjectEditDraft,
  buildProjectUpdatePayload,
  listAvailableProjectMembers,
  type EditableProjectRow,
  type MemberCandidate,
  type ProjectMemberRow,
} from "./project-page.helpers";

describe("project page helpers", () => {
  it("returns only active users who are not already project members", () => {
    const candidates: MemberCandidate[] = [
      { id: "u1", account: "admin", name: "管理员", status: "ACTIVE" },
      { id: "u2", account: "alice", name: "Alice", status: "DISABLED" },
      { id: "u3", account: "bob", name: "Bob", status: "ACTIVE" },
    ];

    const members: ProjectMemberRow[] = [
      { userId: "u1", account: "admin", name: "管理员" },
    ];

    expect(listAvailableProjectMembers(candidates, members)).toEqual([
      { id: "u3", account: "bob", name: "Bob", status: "ACTIVE" },
    ]);
  });

  it("builds an edit draft and update payload for project updates", () => {
    const project: EditableProjectRow = {
      id: "p1",
      name: "智能客服",
      description: "原始说明",
      status: "ACTIVE",
      members: [],
    };

    expect(buildProjectEditDraft(project)).toEqual({
      name: "智能客服",
      description: "原始说明",
    });

    expect(
      buildProjectUpdatePayload(project, {
        name: "智能客服 2.0",
        description: "升级后的说明",
      }),
    ).toEqual({
      name: "智能客服 2.0",
      description: "升级后的说明",
    });
  });
});
