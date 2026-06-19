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

export function showBrowserNotification(title: string, body: string, tag: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  try {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.svg",
      tag,
    });

    notification.onclick = () => {
      window.focus();
      if (typeof window !== "undefined") {
        window.location.href = "/app/notifications";
      }
      notification.close();
    };
  } catch {
    // Notification constructor can fail on some browsers.
  }
}
