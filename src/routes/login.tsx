import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { AuthHeader } from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — StudyMate AI" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background flex flex-col">
      <AuthHeader />

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-xl p-6 sm:p-8 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold font-display tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Sign in to your account to continue learning.
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
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground/80">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  className="pl-10 h-11 bg-card"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-foreground/80">
                  Password
                </Label>
               
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-11 bg-card"
                  required
                />
              </div>
            </div>

          

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-primary hover:opacity-95 shadow-glow group"
            >
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 gap-2 font-medium">
            <GoogleIcon /> Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to StudyMate AI?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>

          
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
