import { API_URL } from "./config";
import { authFetch } from "./client";
import { getAuthToken, clearAuthUser, isTokenExpired } from "@/lib/auth";
import { ApiError } from "./auth";

export type UserSettings = {
  dark_mode: boolean;
  email_reminders: boolean;
  push_notifications: boolean;
  weekly_digest: boolean;
  language: string;
  two_factor_enabled: boolean;
  has_password?: boolean;
};

export type UpdateSettingsPayload = {
  dark_mode: boolean;
  email_reminders: boolean;
  push_notifications: boolean;
  weekly_digest: boolean;
  language: string;
};

export const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "hi-IN", label: "हिन्दी" },
  { value: "es-ES", label: "Español" },
  { value: "fr-FR", label: "Français" },
  { value: "de-DE", label: "Deutsch" },
] as const;

export async function fetchSettings(): Promise<UserSettings> {
  return authFetch("/api/settings") as Promise<UserSettings>;
}

export async function updateSettings(payload: UpdateSettingsPayload): Promise<{ message: string }> {
  return authFetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) as Promise<{ message: string }>;
}

export async function setupTwoFactor(payload: {
  pin: string;
  confirm_pin: string;
}): Promise<{ message: string; enabled: boolean }> {
  return authFetch("/api/settings/two-factor/setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; enabled: boolean }>;
}

export async function disableTwoFactor(payload: {
  pin: string;
  password?: string;
}): Promise<{ message: string; enabled: boolean }> {
  return authFetch("/api/settings/two-factor/disable", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; enabled: boolean }>;
}

export async function requestDataExport(): Promise<{ download_url: string }> {
  return authFetch("/api/settings/export-data") as Promise<{ download_url: string }>;
}

export async function downloadExportedData(downloadPath: string, fileName = "studymate-data.pdf") {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  if (isTokenExpired(token)) {
    clearAuthUser();
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_URL}${downloadPath}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data.message ?? "Failed to download export");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function openExportedDataPreview(downloadPath: string) {
  const previewUrl = `/report-preview?path=${encodeURIComponent(downloadPath)}`;
  window.open(previewUrl, "_blank", "noopener,noreferrer");
}
