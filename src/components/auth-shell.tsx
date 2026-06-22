import { type ReactNode, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-slate-50 dark:bg-[#020617]">
      {/* Celestial base */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,#e0e7ff_0%,#f8fafc_80%)] dark:bg-[radial-gradient(ellipse_at_50%_-20%,#1e1b4b_0%,#020617_80%)]" />

      {/* Animated nebula clouds */}
      <div className="pointer-events-none absolute top-1/4 -left-1/4 h-[60%] w-[60%] rounded-full bg-indigo-300/40 blur-[140px] animate-pulse [animation-duration:8s] dark:bg-indigo-600/15" />
      <div className="pointer-events-none absolute bottom-0 -right-1/4 h-[55%] w-[55%] rounded-full bg-violet-300/40 blur-[140px] animate-pulse [animation-duration:10s] [animation-delay:1s] dark:bg-violet-800/20" />

      {/* Drifting light streaks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-[15%] h-full w-px bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent dark:via-indigo-400/20 rotate-[35deg] blur-[1px] animate-pulse [animation-duration:7s]" />
        <div className="absolute top-0 left-[45%] h-full w-[2px] bg-gradient-to-b from-transparent via-violet-500/20 to-transparent dark:via-violet-300/10 rotate-[35deg] blur-[2px] animate-pulse [animation-duration:11s] [animation-delay:1s]" />
        <div className="absolute top-0 right-[25%] h-full w-px bg-gradient-to-b from-transparent via-fuchsia-500/25 to-transparent dark:via-fuchsia-400/15 rotate-[35deg] blur-[1px] animate-pulse [animation-duration:9s] [animation-delay:2s]" />
      </div>

      {/* Star dust */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          color: "var(--color-foreground)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-20 flex shrink-0 items-center justify-between px-5 py-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2.5 text-slate-900 dark:text-white">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-base font-semibold tracking-tight">StudyMate AI</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Card — centered in remaining viewport */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:pb-6">
        <div className="w-full max-w-[460px]">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-[0_0_100px_-15px_rgba(79,70,229,0.25)] backdrop-blur-3xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-[0_0_100px_-15px_rgba(79,70,229,0.35)] sm:p-6">
            <div className="pointer-events-none absolute -top-1/2 -left-1/2 h-[200%] w-full rotate-[35deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-[3000ms] group-hover:translate-x-full dark:via-white/5" />

            <div className="relative mb-4 text-center">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                <GraduationCap className="h-5 w-5 text-white drop-shadow-md" />
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {title}
              </h1>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>
            </div>

            <div className="relative">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
