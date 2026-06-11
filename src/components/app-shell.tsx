import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Upload, FileText, ClipboardList, Layers,
  MessageSquare, CalendarDays, User, Settings, GraduationCap,
  Moon, Sun, LogOut, Search, Bell,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-sidebar transition-transform lg:translate-x-0 lg:static lg:flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 px-6 border-b">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">StudyMate <span className="text-gradient">AI</span></span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
        <div className="p-3 border-t">
          <Link to="/login" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Log out
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur flex items-center gap-3 px-4 lg:px-6">
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
          <div className="flex-1 sm:hidden" />
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">A</AvatarFallback>
          </Avatar>
        </header>
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
