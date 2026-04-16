import { defineStore } from "pinia";
import type { AuthUser, LoginPayload, LoginResult } from "@yunbei/shared";
import { apiRequest } from "../api/client";

export interface HydratedAuthState {
  accessToken: string;
  currentUser: AuthUser | null;
}

export function hydrateAuthState(storage: {
  accessToken?: string | null;
  currentUser?: string | null;
}): HydratedAuthState {
  const accessToken = storage.accessToken ?? "";
  const serializedUser = storage.currentUser;

  if (!accessToken || !serializedUser) {
    return {
      accessToken: "",
      currentUser: null,
    };
  }

  try {
    return {
      accessToken,
      currentUser: JSON.parse(serializedUser) as AuthUser,
    };
  } catch {
    return {
      accessToken: "",
      currentUser: null,
    };
  }
}

export const useAuthStore = defineStore("auth", {
  state: (): HydratedAuthState => ({
    accessToken: "" as string,
    currentUser: null as LoginResult["user"] | null,
  }),
  actions: {
    restoreSession() {
      if (typeof window === "undefined") {
        return;
      }

      const hydrated = hydrateAuthState({
        accessToken: window.localStorage.getItem("accessToken"),
        currentUser: window.localStorage.getItem("currentUser"),
      });

      this.accessToken = hydrated.accessToken;
      this.currentUser = hydrated.currentUser;
    },
    async login(payload: LoginPayload) {
      const result = await apiRequest<LoginResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      this.accessToken = result.accessToken;
      this.currentUser = result.user;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("accessToken", result.accessToken);
        window.localStorage.setItem("currentUser", JSON.stringify(result.user));
      }
    },
    logout() {
      this.accessToken = "";
      this.currentUser = null;

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem("currentUser");
      }
    },
  },
});
