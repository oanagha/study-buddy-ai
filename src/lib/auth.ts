import type { AuthUser } from "@/lib/api/auth";

const USER_KEY = "studymate_user";
const TOKEN_KEY = "studymate_token";

type JwtPayload = {
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;

    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

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

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const token = getAuthToken();
  const user = getAuthUser();

  if (!token || !user) return false;

  if (isTokenExpired(token)) {
    clearAuthUser();
    return false;
  }

  return true;
}

export function hasValidClientSession(): boolean {
  return isAuthenticated();
}
