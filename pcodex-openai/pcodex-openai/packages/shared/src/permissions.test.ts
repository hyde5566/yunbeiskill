import { describe, expect, it } from "vitest";
import { PERMISSIONS, PERMISSION_META, SYSTEM_CATEGORIES } from "./permissions";

describe("shared permissions", () => {
  it("contains user, project, and skill permissions", () => {
    expect(PERMISSIONS).toContain("user.view");
    expect(PERMISSIONS).toContain("project.member.add");
    expect(PERMISSIONS).toContain("skill.submit");
    expect(PERMISSIONS).toContain("skill.publish");
    expect(PERMISSIONS).toContain("skill.download");
    expect(PERMISSIONS).toContain("skill.rate");
    expect(PERMISSIONS).toContain("skill.rating.view");
    expect(PERMISSIONS).toContain("skill.rating.manage");
    expect(PERMISSIONS).toContain("user.delete");
  });

  it("contains chinese metadata for each permission", () => {
    for (const permissionCode of PERMISSIONS) {
      expect(PERMISSION_META[permissionCode]).toBeDefined();
      expect(PERMISSION_META[permissionCode].module).toBeTruthy();
      expect(PERMISSION_META[permissionCode].name).toBeTruthy();
    }
  });

  it("contains the seven system categories", () => {
    expect(SYSTEM_CATEGORIES).toEqual([
      "AI智能",
      "开发工具",
      "效率提升",
      "数据分析",
      "内容创作",
      "安全合规",
      "通讯协作",
    ]);
  });
});
