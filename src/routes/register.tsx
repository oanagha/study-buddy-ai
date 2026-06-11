import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginBg from "@/assets/loginHero.png.asset.json";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up — StudyMate AI" }] }),
  component: Register,
});

function Register() {
  return (
    <div className="lg:h-screen lg:overflow-hidden min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:block overflow-hidden">
        <img
          src={loginBg.url}
          alt="Students learning with StudyMate AI"
          className="absolute inset-0 h-full w-full object-cover [object-position:center_25%]"
        />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/40 to-secondary/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

        <Link to="/" className="absolute top-8 left-8 inline-flex items-center gap-2.5 z-10">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/30">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-white tracking-tight">
            StudyMate AI
          </span>
        </Link>

        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14 z-10 text-white">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/25 px-3 py-1 text-[11px] font-medium tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Join 120,000+ learners
            </span>
            <h2 className="mt-5 font-display text-3xl xl:text-4xl font-semibold leading-[1.1] tracking-tight">
              Start studying smarter today.
            </h2>
            <ul className="mt-5 space-y-2.5 text-white/90">
              {[
                "Instant AI summaries from any document",
                "Auto-generated quizzes & flashcards",
                "Personalized study plans that adapt to you",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-white/20 ring-1 ring-white/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-background lg:overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg">StudyMate AI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold font-display tracking-tight">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Free forever — no credit card required.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/app/dashboard";
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-foreground/80">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Jane Doe" className="pl-10 h-11 bg-card" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground/80">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name@university.edu" className="pl-10 h-11 bg-card" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-foreground/80">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="At least 8 characters" className="pl-10 h-11 bg-card" required />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-gradient-primary hover:opacity-95 shadow-glow group">
              Create account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By signing up, you agree to our{" "}
              <a href="#" className="text-foreground hover:underline">Terms</a> and{" "}
              <a href="#" className="text-foreground hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 gap-2 font-medium">
            <GoogleIcon /> Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your data is encrypted and never shared
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
