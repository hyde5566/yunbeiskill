import { describe, expect, it } from "vitest";
import { validatePasswordDraft } from "./profile-page.helpers";

describe("profile page helpers", () => {
  it("rejects password changes when confirmation does not match", () => {
    expect(
      validatePasswordDraft({
        currentPassword: "Admin@123456",
        newPassword: "NewPass@123",
        confirmPassword: "Mismatch@123",
      }),
    ).toBe("两次输入的新密码不一致");
  });

  it("rejects password changes when the new password is too short", () => {
    expect(
      validatePasswordDraft({
        currentPassword: "Admin@123456",
        newPassword: "short",
        confirmPassword: "short",
      }),
    ).toBe("新密码至少需要 8 位");
  });

  it("accepts a valid password change draft", () => {
    expect(
      validatePasswordDraft({
        currentPassword: "Admin@123456",
        newPassword: "NewPass@123",
        confirmPassword: "NewPass@123",
      }),
    ).toBeNull();
  });
});
