import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Upload,
  FileText,
  ClipboardList,
  Layers,
  MessageSquare,
  CalendarDays,
  User,
  Settings,
  GraduationCap,
  LogOut,
  Bell,
  BookOpen,
  Flame,
  Pause,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useLayoutEffect, useCallback, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  clearAuthUser,
  getAuthToken,
  getAuthUser,
  hasValidClientSession,
  isTokenExpired,
} from "@/lib/auth";
import { toast } from "sonner";
import {
  fetchDashboardOverview,
  fetchUpcomingSessions,
  type UpcomingSession,
} from "@/lib/api/dashboard";
import { fetchProfile, getProfileInitials, type UserProfile } from "@/lib/api/profile";
import { subscribeProfileUpdates } from "@/lib/profile-sync";
import { fetchActiveStudyPlan, type StudyPlanResult } from "@/lib/api/studyPlan";
import { ApiError } from "@/lib/api/auth";
import {
  clearFocusTimer,
  hasActiveFocusSession,
  readFocusTimer,
  readFocusTimerState,
  writeFocusTimer,
  type FocusTimerSnapshot,
} from "@/lib/focus-timer";
import {
  notifyFocusSessionComplete,
  notifyFocusSessionPaused,
  notifyFocusSessionResumed,
  notifyFocusSessionStarted,
  notifyBrowserNotificationsBlocked,
  requestFocusNotificationPermission,
  areFocusAlertsEnabled,
} from "@/lib/focus-notify";
import {
  getUnreadNotificationCount,
  NOTIFICATIONS_UPDATED_EVENT,
  subscribeUnreadNotificationCount,
} from "@/lib/notifications";

const DEFAULT_FOCUS_MINUTES = 25;

const quickActions = [
  { to: "/app/upload", label: "Upload", icon: Upload },
  { to: "/app/quizzes", label: "Quiz", icon: ClipboardList },
  { to: "/app/chat", label: "Chat", icon: MessageSquare },
] as const;

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function resolveFocusMinutes(plan: StudyPlanResult | null, nextSession: UpcomingSession | null) {
  if (nextSession && plan?.study_plan?.length) {
    const planDay = plan.study_plan.find(
      (day) => day.topic.trim().toLowerCase() === nextSession.topic.trim().toLowerCase(),
    );
    if (planDay?.estimated_hours) {
      return Math.min(60, Math.max(15, Math.round(planDay.estimated_hours * 60)));
    }
  }

  if (plan?.study_hours_per_day) {
    return Math.min(60, Math.max(15, Math.round((plan.study_hours_per_day * 60) / 4)));
  }

  return DEFAULT_FOCUS_MINUTES;
}

function truncateTopic(topic: string, max = 18) {
  return topic.length > max ? `${topic.slice(0, max - 1)}…` : topic;
}

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/upload", label: "Upload Notes", icon: Upload },
  { to: "/app/summaries", label: "Summaries", icon: FileText },
  { to: "/app/study-guide", label: "Study Guide", icon: BookOpen },
  { to: "/app/quizzes", label: "Quizzes", icon: ClipboardList },
  { to: "/app/flashcards", label: "Flashcards", icon: Layers },
  { to: "/app/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/app/planner", label: "Study Planner", icon: CalendarDays },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const authUser = getAuthUser();

  const [studyStreak, setStudyStreak] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanResult | null>(null);
  const [nextSession, setNextSession] = useState<UpcomingSession | null>(null);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [focusTimer, setFocusTimer] = useState<FocusTimerSnapshot | null>(null);
  const focusEndsAtRef = useRef<number | null>(null);
  const focusRunningRef = useRef(false);

  const focusRunning = focusTimer?.running ?? false;
  const focusSecondsLeft = focusTimer?.secondsLeft ?? 0;

  useLayoutEffect(() => {
    const { snapshot, expiredWhileRunning } = readFocusTimerState();
    if (!snapshot) return;

    setFocusTimer(snapshot);
    focusEndsAtRef.current = snapshot.endsAt;
    focusRunningRef.current = snapshot.running;

    if (expiredWhileRunning) {
      notifyFocusSessionComplete();
    }
  }, []);

  useEffect(() => {
    if (!focusTimer) return;
    focusRunningRef.current = focusTimer.running;
    focusEndsAtRef.current = focusTimer.endsAt;
  }, [focusTimer]);

  const updateFocusTimer = useCallback((next: FocusTimerSnapshot) => {
    writeFocusTimer(next);
    setFocusTimer(next);
    focusRunningRef.current = next.running;
    focusEndsAtRef.current = next.endsAt;
  }, []);

  const syncFocusTimerFromStorage = useCallback(() => {
    const stored = readFocusTimer();
    if (!stored) return;
    setFocusTimer(stored);
    focusEndsAtRef.current = stored.endsAt;
    focusRunningRef.current = stored.running;
  }, []);

  const completeFocusTimer = useCallback(
    (durationSeconds: number) => {
      updateFocusTimer({
        running: false,
        endsAt: null,
        secondsLeft: durationSeconds,
        durationSeconds,
      });
      notifyFocusSessionComplete();
    },
    [updateFocusTimer],
  );

  const loadHeaderData = useCallback(async () => {
    setHeaderLoading(true);
    try {
      const [overview, profileData, planData, sessions] = await Promise.all([
        fetchDashboardOverview(),
        fetchProfile(),
        fetchActiveStudyPlan(),
        fetchUpcomingSessions(),
      ]);

      setStudyStreak(overview.study_streak);
      setProfile(profileData);
      setStudyPlan(planData.study_plan.length > 0 ? planData : null);
      setNextSession(sessions[0] ?? null);

      const durationSeconds =
        resolveFocusMinutes(planData.study_plan.length > 0 ? planData : null, sessions[0] ?? null) *
        60;

      const stored = readFocusTimer();
      if (focusRunningRef.current || stored?.running) {
        if (stored) {
          syncFocusTimerFromStorage();
        }
        return;
      }

      if (!stored || !hasActiveFocusSession(stored)) {
        updateFocusTimer({
          running: false,
          endsAt: null,
          secondsLeft: durationSeconds,
          durationSeconds,
        });
      } else {
        updateFocusTimer({
          ...stored,
          durationSeconds,
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      }
    } finally {
      setHeaderLoading(false);
    }
  }, [updateFocusTimer, syncFocusTimerFromStorage]);

  useEffect(() => {
    void loadHeaderData();
  }, [loadHeaderData]);

  useEffect(() => {
    return subscribeProfileUpdates((updated) => {
      setProfile(updated);
    });
  }, []);

  useEffect(() => {
    setUnreadNotifications(getUnreadNotificationCount());

    const unsubscribe = subscribeUnreadNotificationCount(setUnreadNotifications);

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ unreadCount: number }>).detail;
      if (typeof detail?.unreadCount === "number") {
        setUnreadNotifications(detail.unreadCount);
      } else {
        setUnreadNotifications(getUnreadNotificationCount());
      }
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
    return () => {
      unsubscribe();
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const focusMinutes = resolveFocusMinutes(studyPlan, nextSession);

  useEffect(() => {
    if (!focusRunning || focusEndsAtRef.current === null) return;

    const tick = () => {
      const endsAt = focusEndsAtRef.current;
      if (!endsAt) return;

      const remaining = Math.ceil((endsAt - Date.now()) / 1000);
      if (remaining <= 0) {
        completeFocusTimer(focusTimer?.durationSeconds ?? DEFAULT_FOCUS_MINUTES * 60);
        return;
      }

      setFocusTimer((current) => {
        if (!current || current.secondsLeft === remaining) return current;
        const next = { ...current, secondsLeft: remaining };
        writeFocusTimer(next);
        return next;
      });
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [focusRunning, focusTimer?.durationSeconds, completeFocusTimer]);

  const toggleFocusTimer = () => {
    if (!focusTimer) return;

    const durationSeconds = focusMinutes * 60;

    const focusTopic = nextSession
      ? truncateTopic(nextSession.topic)
      : studyPlan?.subject
        ? truncateTopic(studyPlan.subject)
        : "Focus";

    if (focusRunning) {
      notifyFocusSessionPaused(focusSecondsLeft, focusTopic);
      updateFocusTimer({
        running: false,
        endsAt: null,
        secondsLeft: focusSecondsLeft,
        durationSeconds: focusTimer.durationSeconds,
      });
      return;
    }

    const secondsLeft = focusSecondsLeft <= 0 ? durationSeconds : focusSecondsLeft;
    const endsAt = Date.now() + secondsLeft * 1000;
    const isResume = secondsLeft > 0 && secondsLeft < focusTimer.durationSeconds;

    void (async () => {
      if (areFocusAlertsEnabled() && !isResume) {
        const permission = await requestFocusNotificationPermission();
        if (permission === "denied") {
          notifyBrowserNotificationsBlocked();
        }
      }
      if (isResume) {
        notifyFocusSessionResumed(secondsLeft, focusTopic);
      } else {
        notifyFocusSessionStarted(secondsLeft, focusTopic);
      }
    })();

    updateFocusTimer({
      running: true,
      endsAt,
      secondsLeft,
      durationSeconds: focusTimer.durationSeconds || durationSeconds,
    });
  };

  const displayName =
    profile?.full_name?.trim() ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") ||
    "Student";
  const profileSubtitle =
    profile?.course?.trim() || profile?.education?.trim() || profile?.email || "Student";
  const initials = getProfileInitials(displayName);
  const focusLabel = focusRunning
    ? "Focusing"
    : nextSession
      ? truncateTopic(nextSession.topic)
      : studyPlan?.subject
        ? truncateTopic(studyPlan.subject)
        : "Focus";

  useEffect(() => {
    function ensureAuthenticated() {
      const token = getAuthToken();

      if (token && isTokenExpired(token)) {
        clearAuthUser();
        toast.error("Your session has expired. Please sign in again.");
        void router.navigate({ to: "/login", replace: true });
        return;
      }

      if (!hasValidClientSession()) {
        void router.navigate({ to: "/login", replace: true });
      }
    }

    ensureAuthenticated();

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        ensureAuthenticated();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r bg-sidebar transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">
            StudyMate <span className="text-gradient">AI</span>
          </span>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-3">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t p-3">
          <Link
            to="/login"
            onClick={() => {
              clearFocusTimer();
              clearAuthUser();
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" /> Log out
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="z-20 shrink-0 px-3 pt-3 lg:px-5 lg:pt-4">
          <header className="grid h-16 lg:h-20 grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl lg:rounded-3xl border border-border/60 bg-card/60 px-3 lg:px-5 shadow-elegant backdrop-blur-2xl">
            {/* Left: hamburger */}
            <div className="flex items-center justify-start">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                aria-label="Open menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Center: segmented utility strip */}
            <div className="hidden md:flex items-center h-12 lg:h-14 rounded-2xl border border-border/60 bg-background/50 p-1.5 justify-self-center">
              {/* Streak segment */}
              <div className="flex items-center gap-2 px-3 lg:px-4 border-r border-border/60 h-full">
                <div className="relative">
                  <Flame
                    className="h-5 w-5 text-orange-500"
                    fill="currentColor"
                    fillOpacity={0.2}
                  />
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                </div>
                <span className="text-sm font-bold tracking-wider">
                  {headerLoading ? "—" : studyStreak}
                </span>
              </div>

              {/* Quick actions segment */}
              <nav className="flex items-center gap-1 px-2 border-r border-border/60 h-full">
                {quickActions.map((action) => {
                  const active = pathname === action.to;
                  return (
                    <Link
                      key={action.to}
                      to={action.to}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      )}
                    >
                      <action.icon className="h-4 w-4 opacity-70" />
                      <span>{action.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Focus timer segment */}
              <Link
                to="/app/planner"
                className="flex items-center gap-3 pl-4 pr-2 h-full hover:opacity-90 transition-opacity"
                title={
                  nextSession
                    ? `${nextSession.topic} · ${nextSession.date} ${nextSession.time}`
                    : "Open study planner"
                }
              >
                <div className="flex flex-col items-end leading-none min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary/80 mb-1 truncate max-w-[120px]">
                    {focusLabel}
                  </span>
                  <span
                    className="text-base lg:text-lg font-medium tabular-nums font-mono min-w-[4.5ch]"
                    suppressHydrationWarning
                  >
                    {focusTimer ? formatTimer(focusTimer.secondsLeft) : "--:--"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFocusTimer();
                  }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  aria-label={focusRunning ? "Pause focus timer" : "Start focus timer"}
                >
                  {focusRunning ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </Link>
            </div>

            {/* Right: utility cluster + user */}
            <div className="flex items-center justify-end gap-2 lg:gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
                <ThemeToggle className="h-9 w-9 [&_svg]:!size-5" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 [&_svg]:!size-5"
                  aria-label="Notifications"
                  asChild
                >
                  <Link to="/app/notifications">
                    <Bell />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center ring-2 ring-card">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </span>
                    )}
                  </Link>
                </Button>
              </div>

              <Link
                to="/app/profile"
                className="group flex items-center gap-3 pl-1 transition-opacity hover:opacity-90"
                aria-label="Go to profile"
              >
                <div className="hidden sm:block text-right leading-tight min-w-0">
                  <p className="text-sm font-bold truncate max-w-[140px]">{displayName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary truncate max-w-[140px]">
                    {profileSubtitle}
                  </p>
                </div>
                <Avatar
                  key={profile?.profile_image ?? `initials-${initials}`}
                  className="h-10 w-10 rounded-xl ring-4 ring-primary/10 border-2 border-primary/30 cursor-pointer group-hover:border-primary/60 transition-all"
                >
                  {profile?.profile_image ? (
                    <AvatarImage
                      src={profile.profile_image}
                      alt={displayName}
                      className="rounded-xl object-cover"
                    />
                  ) : null}
                  <AvatarFallback
                    delayMs={0}
                    className="rounded-xl bg-gradient-primary text-primary-foreground font-semibold"
                  >
                    {initials || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 animate-fade-in lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
