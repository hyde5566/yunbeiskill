import { describe, expect, it } from "vitest";
import {
  buildNotificationPreview,
  buildNotificationQuery,
  buildNotificationSkillTarget,
  formatNotificationTime,
  getNotificationTypeLabel,
} from "./notification-page.helpers";

describe("notification page helpers", () => {
  it("builds filter query strings", () => {
    expect(buildNotificationQuery("ALL")).toBe("");
    expect(buildNotificationQuery("UNREAD")).toBe("?isRead=false");
    expect(buildNotificationQuery("READ")).toBe("?isRead=true");
  });

  it("builds notification previews with truncation", () => {
    expect(buildNotificationPreview("  已发布新版本  ")).toBe("已发布新版本");
    expect(buildNotificationPreview("a".repeat(80), 10)).toBe("aaaaaaaaaa...");
  });

  it("builds skill targets only when skill id exists", () => {
    expect(buildNotificationSkillTarget({ skillId: "skill-1" })).toEqual({
      path: "/skills",
      query: {
        skillId: "skill-1",
      },
    });

    expect(buildNotificationSkillTarget({ skillId: null })).toBeNull();
  });

  it("formats notification type labels and times", () => {
    expect(getNotificationTypeLabel("SKILL_VERSION_RELEASED")).toBe("Skill 新版本");
    expect(getNotificationTypeLabel("UNKNOWN")).toBe("系统通知");
    expect(formatNotificationTime("2026-04-15T08:30:00.000Z")).toMatch(/^2026-04-15 \d{2}:\d{2}$/);
    expect(formatNotificationTime(null)).toBe("-");
  });
});
