import { describe, expect, it } from "vitest";
import { hydrateAuthState } from "./auth";

describe("auth store helpers", () => {
  it("hydrates auth state from local storage payloads", () => {
    const hydrated = hydrateAuthState({
      accessToken: "token",
      currentUser: JSON.stringify({
        id: "u1",
        account: "admin",
        name: "系统管理员",
        department: "默认根部门",
        permissions: ["dashboard.view"],
      }),
    });

    expect(hydrated.accessToken).toBe("token");
    expect(hydrated.currentUser?.account).toBe("admin");
  });

  it("returns an empty state when storage is invalid", () => {
    const hydrated = hydrateAuthState({
      accessToken: "",
      currentUser: "{broken-json",
    });

    expect(hydrated.accessToken).toBe("");
    expect(hydrated.currentUser).toBeNull();
  });
});
