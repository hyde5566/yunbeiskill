import { afterEach, describe, expect, it, vi } from "vitest";
import { apiDownload, apiRequest } from "./client";

describe("apiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the nested data payload when the response is successful", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: "u1" } }),
      }),
    );

    await expect(apiRequest<{ id: string }>("/users")).resolves.toEqual({ id: "u1" });
  });

  it("surfaces backend business messages when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: "账号已存在" }),
      }),
    );

    await expect(apiRequest("/users")).rejects.toThrow("账号已存在");
  });

  it("does not force a json content-type when sending form data", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { success: true } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.set("name", "Skill");

    await apiRequest<{ success: boolean }>("/skills", {
      method: "POST",
      body: formData,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/skills",
      expect.objectContaining({
        method: "POST",
        body: formData,
        headers: expect.any(Headers),
      }),
    );

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = requestInit.headers as Headers;
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("returns blob downloads and parses the content-disposition file name", async () => {
    const blob = new Blob(["zip-binary"], { type: "application/zip" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => blob,
        headers: {
          get: (name: string) =>
            name === "content-disposition"
              ? 'attachment; filename="skill-demo.zip"'
              : name === "content-type"
                ? "application/zip"
                : null,
        },
      }),
    );

    await expect(apiDownload("/skills/demo/download")).resolves.toEqual({
      blob,
      fileName: "skill-demo.zip",
      mimeType: "application/zip",
    });
  });
});
