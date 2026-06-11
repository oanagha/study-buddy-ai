import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up — StudyMate AI" }] }),
  component: Register,
});

function Register() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-gradient-primary p-12 flex-col justify-between text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.18),transparent)]" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg">StudyMate AI</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-bold font-display leading-tight">Join 50,000+ students<br />learning smarter.</h2>
          <ul className="mt-6 space-y-2 text-primary-foreground/90">
            <li>✓ Unlimited AI summaries</li>
            <li>✓ Auto-generated quizzes</li>
            <li>✓ Personalized study plans</li>
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">© 2026 StudyMate AI</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold font-display">Create your account</h1>
          <p className="text-muted-foreground mt-2">Free forever. No credit card needed.</p>

          <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = "/app/dashboard"; }}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Anagha Verma" className="pl-9 h-11" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@university.edu" className="pl-9 h-11" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="At least 8 characters" className="pl-9 h-11" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirm" type="password" placeholder="Re-enter password" className="pl-9 h-11" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-primary hover:opacity-90 shadow-glow">Create Account</Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
