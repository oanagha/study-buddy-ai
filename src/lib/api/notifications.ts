import { authFetch } from "./client";

export type ServerNotificationType =
  | "UPLOAD"
  | "SUMMARY"
  | "QUIZ"
  | "FLASHCARD"
  | "STUDY_PLAN"
  | "STUDY_GUIDE"
  | "STREAK"
  | "TWO_FACTOR_ENABLED"
  | "TWO_FACTOR_DISABLED"
  | "DATA_EXPORT"
  | "SYSTEM";

export type ServerNotification = {
  id: number;
  title: string;
  message: string;
  type: ServerNotificationType;
  is_read: boolean;
  created_at: string;
};

export async function fetchNotifications(): Promise<ServerNotification[]> {
  const data = (await authFetch("/api/notifications")) as { notifications: ServerNotification[] };
  return data.notifications;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const data = (await authFetch("/api/notifications/unread-count")) as { unread_count: number };
  return data.unread_count;
}

export async function markServerNotificationRead(id: number): Promise<void> {
  await authFetch(`/api/notifications/${id}/read`, { method: "PUT" });
}

export async function markAllServerNotificationsRead(): Promise<void> {
  await authFetch("/api/notifications/read-all", { method: "PUT" });
}

export async function deleteServerNotification(id: number): Promise<void> {
  await authFetch(`/api/notifications/${id}`, { method: "DELETE" });
}
