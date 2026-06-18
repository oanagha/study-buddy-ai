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
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { clearAuthUser, getAuthToken, hasValidClientSession, isTokenExpired } from "@/lib/auth";
import { toast } from "sonner";

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
            onClick={() => clearAuthUser()}
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
          <header className="flex h-16 lg:h-20 items-center justify-between gap-3 rounded-2xl lg:rounded-3xl border border-border/60 bg-card/60 px-3 lg:px-5 shadow-elegant backdrop-blur-2xl">
            {/* Left: hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Center: segmented utility strip */}
            <div className="hidden md:flex items-center h-12 lg:h-14 rounded-2xl border border-border/60 bg-background/50 p-1.5">
              {/* Streak segment */}
              <div className="flex items-center gap-2 px-3 lg:px-4 border-r border-border/60 h-full">
                <div className="relative">
                  <Flame className="h-5 w-5 text-orange-500" fill="currentColor" fillOpacity={0.2} />
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                </div>
                <span className="text-sm font-bold tracking-wider">12</span>
              </div>

              {/* Quick actions segment */}
              <nav className="flex items-center gap-1 px-2 border-r border-border/60 h-full">
                <Link
                  to="/app/upload"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                >
                  <Upload className="h-4 w-4 opacity-70" />
                  <span>Upload</span>
                </Link>
                <Link
                  to="/app/quizzes"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                >
                  <ClipboardList className="h-4 w-4 opacity-70" />
                  <span>Quiz</span>
                </Link>
                <Link
                  to="/app/chat"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                >
                  <MessageSquare className="h-4 w-4 opacity-70" />
                  <span>Chat</span>
                </Link>
              </nav>

              {/* Focus timer segment */}
              <div className="flex items-center gap-3 pl-4 pr-2 h-full">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary/80 mb-1">
                    Focusing
                  </span>
                  <span className="text-base lg:text-lg font-medium tabular-nums font-mono">
                    25:00
                  </span>
                </div>
                <button
                  className="grid h-8 w-8 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  aria-label="Start focus timer"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right: utility cluster + user */}
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
                <ThemeToggle className="h-9 w-9 [&_svg]:!size-5" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 [&_svg]:!size-5"
                  aria-label="Notifications"
                >
                  <Bell />
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-card" />
                </Button>
              </div>

              <Link
                to="/app/profile"
                className="group flex items-center gap-3 pl-1 transition-opacity hover:opacity-90"
                aria-label="Go to profile"
              >
                <div className="hidden sm:block text-right leading-tight">
                  <p className="text-sm font-bold">Alex Rivera</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Pro
                  </p>
                </div>
                <Avatar className="h-10 w-10 rounded-xl ring-4 ring-primary/10 border-2 border-primary/30 cursor-pointer group-hover:border-primary/60 transition-all">
                  <AvatarFallback className="rounded-xl bg-gradient-primary text-primary-foreground font-semibold">
                    A
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
