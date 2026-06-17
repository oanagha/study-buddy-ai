import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Upload, FileText, ClipboardList, Layers,
  MessageSquare, CalendarDays, User, Settings, GraduationCap,
  LogOut, Search, Bell,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { clearAuthUser, getAuthToken, hasValidClientSession, isTokenExpired } from "@/lib/auth";
import { toast } from "sonner";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/upload", label: "Upload Notes", icon: Upload },
  { to: "/app/summaries", label: "Summaries", icon: FileText },
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
          <span className="font-display text-lg font-bold">StudyMate <span className="text-gradient">AI</span></span>
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
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-muted"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="relative max-w-md flex-1 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notes, quizzes, flashcards..." className="pl-9 bg-muted/50 border-0" />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle className="h-11 w-11 [&_svg]:!size-6" />
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 [&_svg]:!size-6"
              aria-label="Notifications"
            >
              <Bell />
            </Button>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">A</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 animate-fade-in lg:p-8">{children}</main>
      </div>
    </div>
  );
}
