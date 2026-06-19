import { toast } from "sonner";
import { addAppNotification } from "@/lib/notifications";

const FOCUS_ALERTS_KEY = "studymate_focus_alerts_enabled";
const FOCUS_STARTED_TOAST_ID = "focus-session-started";
const FOCUS_PAUSED_TOAST_ID = "focus-session-paused";
const FOCUS_RESUMED_TOAST_ID = "focus-session-resumed";
const FOCUS_COMPLETE_TOAST_ID = "focus-session-complete";

type FocusAlertListener = (enabled: boolean) => void;
const alertListeners = new Set<FocusAlertListener>();

function formatFocusDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins} min`;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function areFocusAlertsEnabled() {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(FOCUS_ALERTS_KEY);
  if (stored === null) return true;
  return stored === "true";
}

export function setFocusAlertsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOCUS_ALERTS_KEY, String(enabled));
  alertListeners.forEach((listener) => listener(enabled));
}

export function subscribeFocusAlertsEnabled(listener: FocusAlertListener) {
  alertListeners.add(listener);
  return () => alertListeners.delete(listener);
}

export async function requestFocusNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

function showBrowserNotification(title: string, body: string, tag: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  try {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.svg",
      tag,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    // Notification constructor can fail on some browsers.
  }
}

export function notifyFocusSessionStarted(secondsLeft: number, topic?: string) {
  if (typeof window === "undefined" || !areFocusAlertsEnabled()) return;

  const duration = formatFocusDuration(secondsLeft);
  const topicLine = topic && topic !== "Focus" ? ` · ${topic}` : "";
  const message = `Timer running for ${duration}${topicLine}. Stay focused!`;

  addAppNotification({
    title: "Focus session started",
    message,
    type: "info",
    category: "focus",
  });

  toast.info("Focus session started", {
    id: FOCUS_STARTED_TOAST_ID,
    description: message,
    duration: 6000,
  });

  showBrowserNotification(
    "Focus session started",
    `Your ${duration} study timer is running.${topicLine ? ` Topic: ${topic}.` : ""}`,
    FOCUS_STARTED_TOAST_ID,
  );
}

export function notifyFocusSessionPaused(secondsLeft: number, topic?: string) {
  if (typeof window === "undefined" || !areFocusAlertsEnabled()) return;

  const remaining = formatFocusDuration(secondsLeft);
  const topicLine = topic && topic !== "Focus" ? ` · ${topic}` : "";
  const message = `Timer paused with ${remaining} remaining${topicLine}.`;

  addAppNotification({
    title: "Focus session paused",
    message,
    type: "warning",
    category: "focus",
  });

  toast.warning("Focus session paused", {
    id: FOCUS_PAUSED_TOAST_ID,
    description: message,
    duration: 6000,
  });

  showBrowserNotification("Focus session paused", message, FOCUS_PAUSED_TOAST_ID);
}

export function notifyFocusSessionResumed(secondsLeft: number, topic?: string) {
  if (typeof window === "undefined" || !areFocusAlertsEnabled()) return;

  const remaining = formatFocusDuration(secondsLeft);
  const topicLine = topic && topic !== "Focus" ? ` · ${topic}` : "";
  const message = `Timer resumed with ${remaining} remaining${topicLine}.`;

  addAppNotification({
    title: "Focus session resumed",
    message,
    type: "info",
    category: "focus",
  });

  toast.info("Focus session resumed", {
    id: FOCUS_RESUMED_TOAST_ID,
    description: message,
    duration: 6000,
  });

  showBrowserNotification("Focus session resumed", message, FOCUS_RESUMED_TOAST_ID);
}

export function notifyFocusSessionComplete() {
  if (typeof window === "undefined" || !areFocusAlertsEnabled()) return;

  const message = "Your study timer has ended. Great work — time for a break.";

  addAppNotification({
    title: "Focus session complete",
    message,
    type: "success",
    category: "focus",
  });

  toast.success("Focus session complete!", {
    id: FOCUS_COMPLETE_TOAST_ID,
    description: message,
    duration: 10000,
  });

  showBrowserNotification(
    "Focus session complete",
    "Your study timer has ended. Great work!",
    FOCUS_COMPLETE_TOAST_ID,
  );
}

export function notifyBrowserNotificationsBlocked() {
  if (typeof window === "undefined" || !areFocusAlertsEnabled()) return;

  addAppNotification({
    title: "Browser notifications blocked",
    message: "Allow notifications in site settings to get focus alerts outside the app.",
    type: "warning",
    category: "system",
  });

  toast.message("Browser notifications blocked", {
    description: "Allow notifications in site settings to get focus alerts.",
    duration: 8000,
  });
}
