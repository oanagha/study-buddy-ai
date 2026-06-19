import {
  deleteServerNotification,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllServerNotificationsRead,
  markServerNotificationRead,
  type ServerNotification,
  type ServerNotificationType,
} from "@/lib/api/notifications";
import { showBrowserNotification } from "@/lib/browser-notify";
import { arePushNotificationsEnabled } from "@/lib/push-notifications";

export type LocalNotificationType = "info" | "success" | "warning";
export type AppNotificationType = LocalNotificationType | ServerNotificationType;
export type AppNotificationCategory = "focus" | "system" | "activity";
export type AppNotificationSource = "local" | "server";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: AppNotificationType;
  category: AppNotificationCategory;
  read: boolean;
  createdAt: string;
  source: AppNotificationSource;
  serverId?: number;
};

type NotificationListener = (notifications: AppNotification[]) => void;
type UnreadCountListener = (count: number) => void;

const STORAGE_KEY = "studymate_notifications";
const MAX_LOCAL_NOTIFICATIONS = 100;
const NOTIFICATIONS_UPDATED_EVENT = "studymate-notifications-updated";

const listeners = new Set<NotificationListener>();
const unreadListeners = new Set<UnreadCountListener>();

let serverNotifications: ServerNotification[] = [];
let serverUnreadCount = 0;
let serverRefreshPromise: Promise<void> | null = null;
let knownServerNotificationIds = new Set<number>();
let serverNotificationsInitialized = false;

function notifyNewServerPushAlerts(notifications: ServerNotification[]) {
  const currentIds = new Set(notifications.map((item) => item.id));

  if (!serverNotificationsInitialized) {
    knownServerNotificationIds = currentIds;
    serverNotificationsInitialized = true;
    return;
  }

  if (!arePushNotificationsEnabled()) {
    knownServerNotificationIds = currentIds;
    return;
  }

  const newItems = notifications.filter(
    (item) => !knownServerNotificationIds.has(item.id) && !item.is_read,
  );
  knownServerNotificationIds = currentIds;

  for (const item of newItems.slice(0, 5)) {
    showBrowserNotification(item.title, item.message, `server-notif-${item.id}`);
  }
}

export { NOTIFICATIONS_UPDATED_EVENT };

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `local:${crypto.randomUUID()}`;
  }
  return `local:${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toServerAppNotification(item: ServerNotification): AppNotification {
  return {
    id: `server:${item.id}`,
    serverId: item.id,
    title: item.title,
    message: item.message,
    type: item.type,
    category: item.type === "STREAK" ? "activity" : "activity",
    read: item.is_read,
    createdAt: item.created_at,
    source: "server",
  };
}

function getLocalUnreadCount() {
  return readLocalNotifications().filter((item) => !item.read).length;
}

function getCombinedUnreadCount() {
  return getLocalUnreadCount() + serverUnreadCount;
}

function mergeNotifications(): AppNotification[] {
  const local = readLocalNotifications().map((item) => ({
    ...item,
    source: "local" as const,
  }));
  const server = serverNotifications.map(toServerAppNotification);

  return [...local, ...server].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function emitNotificationChange() {
  const merged = mergeNotifications();
  const unreadCount = getCombinedUnreadCount();

  listeners.forEach((listener) => listener(merged));
  unreadListeners.forEach((listener) => listener(unreadCount));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: { unreadCount } }));
  }
}

function readLocalNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          typeof item.message === "string",
      )
      .map((item) => ({
        ...item,
        source: "local" as const,
        category: item.category ?? "system",
      }));
  } catch {
    return [];
  }
}

function writeLocalNotifications(notifications: AppNotification[]) {
  if (typeof window === "undefined") return;
  const next = notifications.slice(0, MAX_LOCAL_NOTIFICATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitNotificationChange();
}

export function getNotifications() {
  return mergeNotifications();
}

export function getUnreadNotificationCount() {
  return getCombinedUnreadCount();
}

export function subscribeNotifications(listener: NotificationListener) {
  listener(mergeNotifications());
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function subscribeUnreadNotificationCount(listener: UnreadCountListener) {
  listener(getCombinedUnreadCount());
  unreadListeners.add(listener);
  return () => { unreadListeners.delete(listener); };
}

export async function refreshServerNotifications() {
  if (serverRefreshPromise) return serverRefreshPromise;

  serverRefreshPromise = (async () => {
    try {
      const [notifications, unreadCount] = await Promise.all([
        fetchNotifications(),
        fetchUnreadNotificationCount(),
      ]);
      notifyNewServerPushAlerts(notifications);
      serverNotifications = notifications;
      serverUnreadCount = unreadCount;
      emitNotificationChange();
    } catch {
      // Keep existing server cache on failure.
    } finally {
      serverRefreshPromise = null;
    }
  })();

  return serverRefreshPromise;
}

/** Call after server-side activity (upload, generate, etc.) to update the header badge immediately. */
export function refreshNotificationsAfterActivity() {
  void refreshServerNotifications();
}

export function addAppNotification(payload: {
  title: string;
  message: string;
  type?: LocalNotificationType;
  category?: AppNotificationCategory;
}) {
  const notification: AppNotification = {
    id: createLocalId(),
    title: payload.title,
    message: payload.message,
    type: payload.type ?? "info",
    category: payload.category ?? "system",
    read: false,
    createdAt: new Date().toISOString(),
    source: "local",
  };

  const next = [notification, ...readLocalNotifications()].slice(0, MAX_LOCAL_NOTIFICATIONS);
  writeLocalNotifications(next);
  return notification;
}

export async function markNotificationRead(id: string) {
  if (id.startsWith("server:")) {
    const serverId = Number.parseInt(id.replace("server:", ""), 10);
    if (!Number.isInteger(serverId)) return;

    serverNotifications = serverNotifications.map((item) =>
      item.id === serverId ? { ...item, is_read: true } : item,
    );
    serverUnreadCount = serverNotifications.filter((item) => !item.is_read).length;
    emitNotificationChange();

    try {
      await markServerNotificationRead(serverId);
      await refreshServerNotifications();
    } catch {
      await refreshServerNotifications();
    }
    return;
  }

  const next = readLocalNotifications().map((item) =>
    item.id === id ? { ...item, read: true } : item,
  );
  writeLocalNotifications(next);
}

export async function markAllNotificationsRead() {
  const next = readLocalNotifications().map((item) => ({ ...item, read: true }));
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_LOCAL_NOTIFICATIONS)));
  }

  serverNotifications = serverNotifications.map((item) => ({ ...item, is_read: true }));
  serverUnreadCount = 0;
  emitNotificationChange();

  try {
    await markAllServerNotificationsRead();
    await refreshServerNotifications();
  } catch {
    await refreshServerNotifications();
  }
}

export function clearAllLocalNotifications() {
  writeLocalNotifications([]);
}

export async function deleteNotification(id: string) {
  if (id.startsWith("server:")) {
    const serverId = Number.parseInt(id.replace("server:", ""), 10);
    if (!Number.isInteger(serverId)) return;

    serverNotifications = serverNotifications.filter((item) => item.id !== serverId);
    serverUnreadCount = serverNotifications.filter((item) => !item.is_read).length;
    emitNotificationChange();

    try {
      await deleteServerNotification(serverId);
      await refreshServerNotifications();
    } catch {
      await refreshServerNotifications();
    }
    return;
  }

  const next = readLocalNotifications().filter((item) => item.id !== id);
  writeLocalNotifications(next);
}

export function formatNotificationTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getNotificationCategoryLabel(item: AppNotification) {
  if (item.source === "local" && item.category === "focus") return "focus";
  if (item.source === "server") return item.type.toLowerCase().replace("_", " ");
  return item.category;
}

export function isServerNotificationType(
  type: AppNotificationType,
): type is ServerNotificationType {
  return (
    type === "UPLOAD" ||
    type === "SUMMARY" ||
    type === "QUIZ" ||
    type === "FLASHCARD" ||
    type === "STUDY_PLAN" ||
    type === "STUDY_GUIDE" ||
    type === "STREAK" ||
    type === "TWO_FACTOR_ENABLED" ||
    type === "TWO_FACTOR_DISABLED" ||
    type === "DATA_EXPORT" ||
    type === "SYSTEM"
  );
}
