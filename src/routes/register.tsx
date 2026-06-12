import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AuthHeader } from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up — StudyMate AI" }] }),
  component: Register,
});

function Register() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background flex flex-col">
      <AuthHeader />

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-xl p-6 sm:p-8 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold font-display tracking-tight">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Free forever — no credit card required.
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
            Create your account
          </h2>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const password = (form.elements.namedItem("password") as HTMLInputElement).value;
              const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
              if (password !== confirmPassword) {
                toast.error("Passwords do not match.");
                return;
              }
              window.location.href = "/app/dashboard";
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium text-foreground/80">
                  First name
                </Label>
                <Input id="firstName" placeholder="Jane" className="h-11 bg-card" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium text-foreground/80">
                  Last name
                </Label>
                <Input id="lastName" placeholder="Doe" className="h-11 bg-card" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground/80">
                Email
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
              <Label htmlFor="password" className="text-xs font-medium text-foreground/80">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="pl-10 h-11 bg-card"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground/80">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  className="pl-10 h-11 bg-card"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-primary hover:opacity-95 shadow-glow group"
            >
              Create account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By signing up, you agree to our{" "}
              <a href="#" className="text-foreground hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-foreground hover:underline">
                Privacy Policy
              </a>
              .
            </p>
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
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>

          
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
