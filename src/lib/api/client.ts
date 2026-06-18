import { API_URL } from "./config";
import { getAuthToken, clearAuthUser, isTokenExpired } from "@/lib/auth";
import { ApiError } from "./auth";

type ApiErrorBody = {
  status: "error";
  message: string;
  errors?: { field: string; message: string }[];
};

export async function authFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  if (isTokenExpired(token)) {
    clearAuthUser();
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthUser();
    }

    const error = data as ApiErrorBody;
    throw new ApiError(response.status, error.message ?? "Request failed", error.errors);
  }

  return data;
}
