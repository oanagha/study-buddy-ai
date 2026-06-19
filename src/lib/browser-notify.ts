import { navigateFromNotification } from "@/lib/notification-routes";

export async function requestBrowserNotificationPermission(): Promise<
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

export type BrowserNotificationOptions = {
  url?: string;
  onClick?: () => void;
};

export function showBrowserNotification(
  title: string,
  body: string,
  tag: string,
  options?: BrowserNotificationOptions,
) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const url = options?.url ?? "/app/notifications";

  try {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.svg",
      tag,
    });

    notification.onclick = () => {
      window.focus();
      options?.onClick?.();
      navigateFromNotification(url);
      notification.close();
    };
  } catch {
    // Notification constructor can fail on some browsers.
  }
}
