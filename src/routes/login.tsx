import { createFileRoute, Link } from "@tanstack/react-router";
import { Rocket, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — StudyMate AI" }] }),
  component: Login,
});

function Login() {
  const { theme, toggle } = useTheme();
  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 h-14 border-b border-border bg-background/80 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
            <Rocket className="h-4 w-4" strokeWidth={2} />
          </span>
          StudyMate
        </Link>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="h-9 w-9 grid place-items-center rounded-full border border-border text-foreground hover:bg-muted transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <div className="flex-1 w-full grid md:grid-cols-2">
        {/* Left themed panel */}
        <div className="relative bg-gradient-primary p-10 flex flex-col text-white overflow-hidden">
          <h2 className="font-display text-3xl font-light tracking-wide">Welcome to</h2>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-lg mb-5">
              <Rocket className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-wide text-white">StudyMate</h1>
            <p className="mt-6 text-sm text-white/80 leading-relaxed max-w-xs">
              Turn your notes into summaries, quizzes, and flashcards.
              AI-powered learning that adapts to you.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-white/70">
            <span>LEARN <span className="text-white font-semibold ml-1">SMARTER</span></span>
            <span className="h-3 w-px bg-white/40" />
            <span>STUDY <span className="text-white font-semibold ml-1">FASTER</span></span>
          </div>


          <svg
            className="absolute top-0 right-0 h-full w-16 text-background"
            viewBox="0 0 60 600"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M60,0 Q20,75 40,150 Q60,225 20,300 Q-10,375 40,450 Q60,525 30,600 L60,600 Z" opacity="0.15" />
            <path d="M60,0 Q30,75 50,150 Q70,225 30,300 Q0,375 50,450 Q70,525 40,600 L60,600 Z" opacity="0.25" />
            <path d="M60,0 Q40,75 55,150 Q75,225 40,300 Q15,375 55,450 Q75,525 50,600 L60,600 Z" />
          </svg>
        </div>

        {/* Right form panel */}
        <div className="p-10 sm:p-12 flex flex-col justify-center bg-background">
          <h2 className="font-display text-3xl text-center text-foreground font-normal mb-8">
            Welcome back
          </h2>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/app/dashboard";
            }}
          >
            <Field label="E-mail Address" type="email" placeholder="Enter your mail" />
            <Field label="Password" type="password" placeholder="Enter your password" />

            <label className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--primary)]" />
              <span>Keep me signed in.{" "}
                <a href="#" className="text-primary hover:underline">Forgot password?</a>
              </span>
            </label>

            <div className="flex items-center gap-4 pt-2">
              <Button
                type="submit"
                className="rounded-full px-8 h-11 bg-gradient-primary text-white shadow-glow hover:opacity-90"
              >
                Sign In
              </Button>

              <Link
                to="/register"
                className="rounded-full px-8 h-11 inline-flex items-center justify-center border border-border text-foreground hover:bg-muted text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-sm text-foreground mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="w-full bg-transparent border-0 border-b border-border focus:border-primary focus:ring-0 outline-none py-2 text-sm text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}
