import type { ServerNotificationType } from "@/lib/api/notifications";

export const NOTIFICATION_NAVIGATE_EVENT = "studymate-notification-navigate";
export const PENDING_NOTIFICATION_ROUTE_KEY = "studymate_pending_notification_route";

const SERVER_NOTIFICATION_ROUTES: Record<ServerNotificationType, string> = {
  UPLOAD: "/app/upload",
  SUMMARY: "/app/summaries",
  QUIZ: "/app/quizzes",
  FLASHCARD: "/app/flashcards",
  STUDY_PLAN: "/app/planner",
  SESSION_REMINDER: "/app/planner",
  STUDY_GUIDE: "/app/study-guide",
  STREAK: "/app/dashboard",
  TWO_FACTOR_ENABLED: "/app/settings",
  TWO_FACTOR_DISABLED: "/app/settings",
  DATA_EXPORT: "/app/settings",
  SYSTEM: "/app/notifications",
};

export function getRouteForServerNotificationType(type: ServerNotificationType) {
  return SERVER_NOTIFICATION_ROUTES[type] ?? "/app/notifications";
}

export function getRouteForFocusNotification() {
  return "/app/planner";
}

export function navigateFromNotification(path: string) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(PENDING_NOTIFICATION_ROUTE_KEY, path);
  window.dispatchEvent(new CustomEvent(NOTIFICATION_NAVIGATE_EVENT, { detail: { path } }));

  if (!window.location.pathname.startsWith("/app")) {
    window.location.href = path;
  }
}

export function consumePendingNotificationRoute() {
  if (typeof window === "undefined") return null;
  const path = sessionStorage.getItem(PENDING_NOTIFICATION_ROUTE_KEY);
  if (path) {
    sessionStorage.removeItem(PENDING_NOTIFICATION_ROUTE_KEY);
  }
  return path;
}
