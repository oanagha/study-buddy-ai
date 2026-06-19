import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  FileText,
  Layers,
  ClipboardCheck,
  Flame,
  Upload,
  ArrowRight,
  FileType,
  File as FileIcon,
  FileCode,
  Clock,
  BookOpen,
} from "lucide-react";
import { StatCard, PageHeader } from "@/components/widgets";
import { LoadingState } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  type DashboardOverview,
  type WeeklyActivityDay,
  type UpcomingSession,
  type RecentUpload,
  type SubjectProgress,
  type RecentQuiz,
} from "@/lib/api/dashboard";
import { getAuthUser } from "@/lib/auth";
import { ApiError } from "@/lib/api/auth";
import { toast } from "sonner";
import {
  useDashboardOverviewQuery,
  useWeeklyActivityQuery,
  useUpcomingSessionsQuery,
  useRecentUploadsQuery,
  useLearningProgressQuery,
  useRecentQuizzesQuery,
} from "@/lib/queries/hooks";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — StudyMate AI" }] }),
  component: Dashboard,
});

const fileIcons: Record<string, typeof FileText> = { pdf: FileType, docx: FileIcon, txt: FileCode };

const statConfig = [
  {
    key: "notes_uploaded" as const,
    label: "Notes Uploaded",
    icon: FileText,
    tint: "primary" as const,
  },
  {
    key: "flashcards_generated" as const,
    label: "Flashcards Generated",
    icon: Layers,
    tint: "secondary" as const,
  },
  {
    key: "quizzes_completed" as const,
    label: "Quizzes Completed",
    icon: ClipboardCheck,
    tint: "accent" as const,
  },
  { key: "study_streak" as const, label: "Study Streak", icon: Flame, tint: "warning" as const },
];

function formatStatValue(key: keyof DashboardOverview, value: number) {
  if (key === "study_streak") {
    return value === 1 ? "1 day" : `${value} days`;
  }
  return value;
}

function getFileTypeFromTitle(title: string) {
  const ext = title.slice(title.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  if (ext === ".txt") return "txt";
  return "pdf";
}

function formatUploadDate(uploadedAt: string) {
  const date = new Date(uploadedAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const uploadDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - uploadDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatSessionLabel(date: string, time: string) {
  const sessionDate = new Date(`${date}T${time}:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayStart = new Date(`${date}T00:00:00`);
  const timeLabel = sessionDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (dayStart.getTime() === today.getTime()) {
    return `Today, ${timeLabel}`;
  }
  if (dayStart.getTime() === tomorrow.getTime()) {
    return `Tomorrow, ${timeLabel}`;
  }

  const dateLabel = sessionDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${dateLabel}, ${timeLabel}`;
}

function Dashboard() {
  const user = getAuthUser();
  const overviewQuery = useDashboardOverviewQuery();
  const weeklyQuery = useWeeklyActivityQuery();
  const sessionsQuery = useUpcomingSessionsQuery();
  const uploadsQuery = useRecentUploadsQuery();
  const progressQuery = useLearningProgressQuery();
  const quizzesQuery = useRecentQuizzesQuery();

  const stats = overviewQuery.data ?? null;
  const weeklyActivity = weeklyQuery.data ?? [];
  const upcomingSessions = sessionsQuery.data ?? [];
  const recentUploads = uploadsQuery.data ?? [];
  const learningProgress = progressQuery.data ?? [];
  const recentQuizzes = quizzesQuery.data ?? [];

  const loadingStats = overviewQuery.isPending;
  const loadingWeekly = weeklyQuery.isPending;
  const loadingSessions = sessionsQuery.isPending;
  const loadingUploads = uploadsQuery.isPending;
  const loadingProgress = progressQuery.isPending;
  const loadingQuizzes = quizzesQuery.isPending;

  useEffect(() => {
    const error =
      overviewQuery.error ??
      weeklyQuery.error ??
      sessionsQuery.error ??
      uploadsQuery.error ??
      progressQuery.error ??
      quizzesQuery.error;

    if (error instanceof ApiError) {
      toast.error(error.message);
    } else if (error) {
      toast.error("Failed to load dashboard stats.");
    }
  }, [
    overviewQuery.error,
    weeklyQuery.error,
    sessionsQuery.error,
    uploadsQuery.error,
    progressQuery.error,
    quizzesQuery.error,
  ]);

  const firstName = user?.firstName ?? "Student";
  const streak = stats?.study_streak ?? 0;
  const subtitle =
    streak > 0
      ? `You're on a ${streak}-day streak. Let's make today count.`
      : "Start studying today to build your streak.";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={`Welcome Back, ${firstName} 👋`}
        subtitle={subtitle}
        action={
          <Link to="/app/upload">
            <Button className="bg-gradient-primary shadow-glow hover:opacity-90">
              <Upload className="h-4 w-4" /> Upload Notes
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingStats ? (
          <Card className="p-5 sm:col-span-2 lg:col-span-4">
            <LoadingState label="Loading dashboard stats" className="py-4 text-muted-foreground" />
          </Card>
        ) : (
          statConfig.map((s) => {
            const Icon = s.icon;
            const value = stats?.[s.key] ?? 0;
            return (
              <StatCard
                key={s.key}
                label={s.label}
                value={formatStatValue(s.key, value)}
                icon={<Icon className="h-5 w-5" />}
                tint={s.tint}
              />
            );
          })
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <Card className="p-6 lg:col-span-2 shadow-card border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Weekly Activity</h3>
              <p className="text-sm text-muted-foreground">Study hours over the last 7 days</p>
            </div>
          </div>
          <div className="h-64">
            {loadingWeekly ? (
              <LoadingState label="Loading activity" className="h-full text-muted-foreground" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivity}>
                  <defs>
                    <linearGradient id="hours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.534 0.226 277)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.534 0.226 277)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.92 0.01 260)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="currentColor"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    stroke="currentColor"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="oklch(0.534 0.226 277)"
                    strokeWidth={2.5}
                    fill="url(#hours)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Upcoming */}
        <Card className="p-6 shadow-card border-border/50 flex flex-col">
          <h3 className="font-display font-semibold text-lg mb-4 shrink-0">Upcoming Sessions</h3>
          <div className="h-64 overflow-y-auto pr-1">
            {loadingSessions ? (
              <LoadingState label="Loading sessions" className="h-full text-muted-foreground" />
            ) : upcomingSessions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Clock className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No upcoming sessions</p>
                <Link
                  to="/app/planner"
                  className="text-xs text-primary font-medium mt-1 inline-block"
                >
                  Create a study plan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((s) => (
                  <div
                    key={`${s.date}-${s.time}-${s.topic}`}
                    className="flex gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted transition"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{s.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSessionLabel(s.date, s.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent uploads */}
        <Card className="p-6 shadow-card border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Recent Uploads</h3>
            <Link
              to="/app/upload"
              className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {loadingUploads ? (
              <LoadingState label="Loading uploads" className="py-8 text-muted-foreground" />
            ) : recentUploads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No uploads yet</p>
              </div>
            ) : (
              recentUploads.map((f) => {
                const Icon = fileIcons[getFileTypeFromTitle(f.title)] ?? FileText;
                return (
                  <div
                    key={`${f.title}-${f.uploaded_at}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition cursor-pointer"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{f.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatUploadDate(f.uploaded_at)} • {f.size}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Learning progress */}
        <Card className="p-6 shadow-card border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Learning Progress</h3>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {loadingProgress ? (
              <LoadingState label="Loading progress" className="py-8 text-muted-foreground" />
            ) : learningProgress.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Complete quizzes to track subject progress</p>
              </div>
            ) : (
              learningProgress.map((p) => (
                <div key={p.subject}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{p.subject}</span>
                    <span className="text-muted-foreground">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-2" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent quizzes */}
      <Card className="p-6 shadow-card border-border/50">
        <h3 className="font-display font-semibold text-lg mb-4">Recent Quizzes</h3>
        {loadingQuizzes ? (
          <LoadingState label="Loading quizzes" className="py-8 text-muted-foreground" />
        ) : recentQuizzes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No quizzes completed yet</p>
            <Link to="/app/quizzes" className="text-xs text-primary font-medium mt-1 inline-block">
              Take a quiz
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {recentQuizzes.map((q) => (
              <div
                key={`${q.title}-${q.completed_at}-${q.score}`}
                className="rounded-xl border p-4 hover:shadow-card transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{q.title}</p>
                  <Badge
                    className={
                      q.score >= 85
                        ? "bg-accent text-accent-foreground"
                        : "bg-warning text-warning-foreground"
                    }
                  >
                    {q.score}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {q.questions} questions • {q.completed_at}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
