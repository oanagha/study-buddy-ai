const PUSH_ENABLED_KEY = "studymate_push_notifications_enabled";

type PushListener = (enabled: boolean) => void;
const listeners = new Set<PushListener>();

function readCachedPushEnabled() {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(PUSH_ENABLED_KEY);
  return stored === "true";
}

let pushEnabled = readCachedPushEnabled();

export function arePushNotificationsEnabled() {
  return pushEnabled;
}

export function setPushNotificationsEnabled(enabled: boolean) {
  pushEnabled = enabled;
  if (typeof window !== "undefined") {
    localStorage.setItem(PUSH_ENABLED_KEY, String(enabled));
  }
  listeners.forEach((listener) => listener(enabled));
}

export function subscribePushNotificationsEnabled(listener: PushListener) {
  listener(pushEnabled);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function syncPushNotificationsFromSettings(enabled: boolean) {
  setPushNotificationsEnabled(enabled);
}
