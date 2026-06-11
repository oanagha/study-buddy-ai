import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText, Layers, ClipboardCheck, Flame, Upload, ArrowRight,
  FileType, File as FileIcon, FileCode, Clock, BookOpen,
} from "lucide-react";
import { StatCard, PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  stats, recentUploads, recentQuizzes, weeklyActivity, learningProgress, upcomingSessions,
} from "@/lib/mock-data";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — StudyMate AI" }] }),
  component: Dashboard,
});

const iconMap = { FileText, Layers, ClipboardCheck, Flame } as const;
const fileIcons: Record<string, typeof FileText> = { pdf: FileType, docx: FileIcon, txt: FileCode };

function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Welcome Back, Anagha 👋"
        subtitle="You're on a 12-day streak. Let's make today count."
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
        {stats.map((s, i) => {
          const Icon = iconMap[s.icon as keyof typeof iconMap];
          const tints = ["primary", "secondary", "accent", "warning"] as const;
          return (
            <StatCard key={s.label} label={s.label} value={s.value} change={s.change} icon={<Icon className="h-5 w-5" />} tint={tints[i]} />
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <Card className="p-6 lg:col-span-2 shadow-card border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Weekly Activity</h3>
              <p className="text-sm text-muted-foreground">Study hours over the last 7 days</p>
            </div>
            <Badge variant="secondary" className="bg-accent/15 text-accent border-0">+18% vs last week</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="hours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.534 0.226 277)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.534 0.226 277)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 260)" vertical={false} />
                <XAxis dataKey="day" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} className="text-muted-foreground" />
                <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} className="text-muted-foreground" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="hours" stroke="oklch(0.534 0.226 277)" strokeWidth={2.5} fill="url(#hours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Upcoming */}
        <Card className="p-6 shadow-card border-border/50">
          <h3 className="font-display font-semibold text-lg mb-4">Upcoming Sessions</h3>
          <div className="space-y-3">
            {upcomingSessions.map((s) => (
              <div key={s.id} className="flex gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted transition">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.time}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0 self-start">{s.subject}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent uploads */}
        <Card className="p-6 shadow-card border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Recent Uploads</h3>
            <Link to="/app/upload" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentUploads.slice(0, 4).map((f) => {
              const Icon = fileIcons[f.type] ?? FileText;
              return (
                <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition cursor-pointer">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.date} • {f.size}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Learning progress */}
        <Card className="p-6 shadow-card border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Learning Progress</h3>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {learningProgress.map((p) => (
              <div key={p.subject}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{p.subject}</span>
                  <span className="text-muted-foreground">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent quizzes */}
      <Card className="p-6 shadow-card border-border/50">
        <h3 className="font-display font-semibold text-lg mb-4">Recent Quizzes</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {recentQuizzes.map((q) => (
            <div key={q.id} className="rounded-xl border p-4 hover:shadow-card transition">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{q.title}</p>
                <Badge className={q.score >= 85 ? "bg-accent text-accent-foreground" : "bg-warning text-warning-foreground"}>
                  {q.score}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{q.total} questions • {q.date}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
