import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const hideScrollbar = {
  scrollbarWidth: "none" as const,
  msOverflowStyle: "none" as const,
};
const webkitHide = "::-webkit-scrollbar{display:none}";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#020617] py-4 sm:py-6">
      {/* Celestial base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,#e0e7ff_0%,#f8fafc_80%)] dark:bg-[radial-gradient(ellipse_at_50%_-20%,#1e1b4b_0%,#020617_80%)]" />

      {/* Animated nebula clouds */}
      <div className="absolute top-1/4 -left-1/4 w-[80%] h-[80%] rounded-full blur-[140px] animate-pulse [animation-duration:8s] bg-indigo-300/40 dark:bg-indigo-600/15" />
      <div className="absolute bottom-0 -right-1/4 w-[70%] h-[70%] rounded-full blur-[140px] animate-pulse [animation-duration:10s] [animation-delay:1s] bg-violet-300/40 dark:bg-violet-800/20" />

      {/* Drifting light streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] left-[15%] w-px h-[120%] bg-gradient-to-b from-transparent via-indigo-500/30 dark:via-indigo-400/20 to-transparent rotate-[35deg] blur-[1px] animate-pulse [animation-duration:7s]" />
        <div className="absolute -top-[20%] left-[45%] w-[2px] h-[140%] bg-gradient-to-b from-transparent via-violet-500/20 dark:via-violet-300/10 to-transparent rotate-[35deg] blur-[2px] animate-pulse [animation-duration:11s] [animation-delay:1s]" />
        <div className="absolute -top-[5%] right-[25%] w-px h-full bg-gradient-to-b from-transparent via-fuchsia-500/25 dark:via-fuchsia-400/15 to-transparent rotate-[35deg] blur-[1px] animate-pulse [animation-duration:9s] [animation-delay:2s]" />
      </div>

      {/* Star dust */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          color: "var(--color-foreground)",
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2.5 text-slate-900 dark:text-white">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display font-semibold text-base tracking-tight">StudyMate AI</span>
        </Link>
        <div className="text-slate-700 dark:text-white/70">
          <ThemeToggle />
        </div>
      </div>

      {/* Floating card */}
      <div className="relative z-10 w-full max-w-[460px] px-4 animate-float">
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-200/70 dark:border-white/10 rounded-3xl shadow-[0_0_100px_-15px_rgba(79,70,229,0.25)] dark:shadow-[0_0_100px_-15px_rgba(79,70,229,0.35)] p-5 sm:p-6 relative overflow-hidden group">
          {/* Inner shimmer streak */}
          <div className="absolute -top-1/2 -left-1/2 w-full h-[200%] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent rotate-[35deg] pointer-events-none group-hover:translate-x-full transition-transform duration-[3000ms]" />

          {/* Header */}
          <div className="text-center mb-4 relative">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 mb-2 shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <GraduationCap className="w-5 h-5 text-white drop-shadow-md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>
          </div>

          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
