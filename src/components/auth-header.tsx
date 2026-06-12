import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-background/80 backdrop-blur flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2.5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-md">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-display font-semibold text-lg tracking-tight">StudyMate AI</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
