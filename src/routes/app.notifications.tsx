import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Info,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  ClipboardList,
  Layers,
  CalendarDays,
  Clock,
  Flame,
  BookOpen,
  Shield,
  ShieldOff,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { LoadingState } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/auth";
import {
  clearAllLocalNotifications,
  formatNotificationTime,
  getNotificationCategoryLabel,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  refreshServerNotifications,
  deleteNotification,
  subscribeNotifications,
  type AppNotification,
} from "@/lib/notifications";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — StudyMate AI" }] }),
  component: Notifications,
});

function NotificationIcon({ item }: { item: AppNotification }) {
  if (item.source === "local") {
    if (item.type === "success") {
      return <CheckCircle2 className="h-5 w-5 text-accent" />;
    }
    if (item.type === "warning") {
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    }
    return <Info className="h-5 w-5 text-primary" />;
  }

  switch (item.type) {
    case "UPLOAD":
      return <Upload className="h-5 w-5 text-primary" />;
    case "SUMMARY":
      return <FileText className="h-5 w-5 text-primary" />;
    case "QUIZ":
      return <ClipboardList className="h-5 w-5 text-primary" />;
    case "FLASHCARD":
      return <Layers className="h-5 w-5 text-primary" />;
    case "STUDY_PLAN":
      return <CalendarDays className="h-5 w-5 text-primary" />;
    case "SESSION_REMINDER":
      return <Clock className="h-5 w-5 text-primary" />;
    case "STUDY_GUIDE":
      return <BookOpen className="h-5 w-5 text-primary" />;
    case "STREAK":
      return <Flame className="h-5 w-5 text-orange-500" />;
    case "TWO_FACTOR_ENABLED":
      return <Shield className="h-5 w-5 text-accent" />;
    case "TWO_FACTOR_DISABLED":
      return <ShieldOff className="h-5 w-5 text-warning" />;
    case "DATA_EXPORT":
      return <Download className="h-5 w-5 text-primary" />;
    default:
      return <Info className="h-5 w-5 text-primary" />;
  }
}

function Notifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getNotifications());
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      await refreshServerNotifications();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    return subscribeNotifications(setNotifications);
  }, [loadNotifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      }
    }
  };

  const handleClearLocal = () => {
    clearAllLocalNotifications();
    toast.success("Focus notifications cleared");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Study activity updates and focus timer alerts."
        action={
          notifications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => void handleMarkAllRead()}>
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleClearLocal}>
                <Trash2 className="h-4 w-4" />
                Clear focus alerts
              </Button>
            </div>
          ) : undefined
        }
      />

      {loading && notifications.length === 0 ? (
        <Card className="p-10 shadow-card border-border/50">
          <LoadingState label="Loading notifications" className="py-4 text-muted-foreground" />
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-10 text-center shadow-card border-border/50">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-muted">
            <Bell className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="font-display text-lg font-semibold">No notifications yet</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Upload notes, generate quizzes, or start a focus session to see updates here.
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
                if (!item.read) void handleMarkRead(item.id);
              }}
              onKeyDown={(e) => {
                if (!item.read && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  void handleMarkRead(item.id);
                }
              }}
              className={cn(
                "p-4 shadow-card border-border/50 transition hover:shadow-glow/20",
                !item.read && "border-primary/30 bg-primary/5 cursor-pointer",
              )}
            >
              <div className="flex gap-3">
                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted/70">
                  <NotificationIcon item={item} />
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
                          {getNotificationCategoryLabel(item)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatNotificationTime(item.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!item.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleMarkRead(item.id);
                          }}
                        >
                          Mark read
                        </Button>
                      )}
                      {item.source === "server" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          aria-label="Delete notification"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
