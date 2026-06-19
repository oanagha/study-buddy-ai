import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Info, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  clearAllNotifications,
  formatNotificationTime,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
  type AppNotification,
} from "@/lib/notifications";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — StudyMate AI" }] }),
  component: Notifications,
});

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  if (type === "success") {
    return <CheckCircle2 className="h-5 w-5 text-accent" />;
  }
  if (type === "warning") {
    return <AlertTriangle className="h-5 w-5 text-warning" />;
  }
  return <Info className="h-5 w-5 text-primary" />;
}

function Notifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getNotifications());

  useEffect(() => {
    return subscribeNotifications(setNotifications);
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Your recent alerts and activity updates."
        action={
          notifications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button>
            </div>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <Card className="p-10 text-center shadow-card border-border/50">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-muted">
            <Bell className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="font-display text-lg font-semibold">No notifications yet</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Focus timer alerts and other updates will appear here when they happen.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!item.read) markNotificationRead(item.id);
              }}
              onKeyDown={(e) => {
                if (!item.read && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  markNotificationRead(item.id);
                }
              }}
              className={cn(
                "p-4 shadow-card border-border/50 transition hover:shadow-glow/20",
                !item.read && "border-primary/30 bg-primary/5 cursor-pointer",
              )}
            >
              <div className="flex gap-3">
                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted/70">
                  <NotificationIcon type={item.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        {!item.read && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                            New
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatNotificationTime(item.createdAt)}
                      </p>
                    </div>
                    {!item.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead(item.id);
                        }}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
