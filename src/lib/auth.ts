import type { AuthUser } from "@/lib/api/auth";

const USER_KEY = "studymate_user";
const TOKEN_KEY = "studymate_token";

export function setAuthSession({ user, token }: { user: AuthUser; token?: string }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function setAuthUser(user: AuthUser) {
  setAuthSession({ user });
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
