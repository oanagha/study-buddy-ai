export type AppNotificationType = "info" | "success" | "warning";

export type AppNotificationCategory = "focus" | "system";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: AppNotificationType;
  category: AppNotificationCategory;
  read: boolean;
  createdAt: string;
};

type NotificationListener = (notifications: AppNotification[]) => void;
type UnreadCountListener = (count: number) => void;

const STORAGE_KEY = "studymate_notifications";
const MAX_NOTIFICATIONS = 100;
const NOTIFICATIONS_UPDATED_EVENT = "studymate-notifications-updated";

const listeners = new Set<NotificationListener>();
const unreadListeners = new Set<UnreadCountListener>();

export { NOTIFICATIONS_UPDATED_EVENT };

function getUnreadCount(notifications: AppNotification[]) {
  return notifications.filter((item) => !item.read).length;
}

function emitNotificationChange(notifications: AppNotification[]) {
  const unreadCount = getUnreadCount(notifications);
  listeners.forEach((listener) => listener(notifications));
  unreadListeners.forEach((listener) => listener(unreadCount));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: { unreadCount } }));
  }
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.message === "string",
    );
  } catch {
    return [];
  }
}

function writeNotifications(notifications: AppNotification[]) {
  if (typeof window === "undefined") return;
  const next = notifications.slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitNotificationChange(next);
}

export function getNotifications() {
  return readNotifications();
}

export function getUnreadNotificationCount() {
  return getUnreadCount(readNotifications());
}

export function subscribeNotifications(listener: NotificationListener) {
  listener(readNotifications());
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function subscribeUnreadNotificationCount(listener: UnreadCountListener) {
  listener(getUnreadNotificationCount());
  unreadListeners.add(listener);
  return () => unreadListeners.delete(listener);
}

export function addAppNotification(payload: {
  title: string;
  message: string;
  type?: AppNotificationType;
  category?: AppNotificationCategory;
}) {
  const notification: AppNotification = {
    id: createId(),
    title: payload.title,
    message: payload.message,
    type: payload.type ?? "info",
    category: payload.category ?? "system",
    read: false,
    createdAt: new Date().toISOString(),
  };

  const next = [notification, ...readNotifications()].slice(0, MAX_NOTIFICATIONS);
  writeNotifications(next);
  return notification;
}

export function markNotificationRead(id: string) {
  const next = readNotifications().map((item) => (item.id === id ? { ...item, read: true } : item));
  writeNotifications(next);
}

export function markAllNotificationsRead() {
  const next = readNotifications().map((item) => ({ ...item, read: true }));
  writeNotifications(next);
}

export function clearAllNotifications() {
  writeNotifications([]);
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
