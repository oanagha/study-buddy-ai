import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginBg from "@/assets/loginBg.png.asset.json";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up — StudyMate AI" }] }),
  component: Register,
});

function Register() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f5f3ff]">
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('${loginBg.url}')` }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

        <Link to="/" className="relative z-10 inline-flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">StudyMate AI</span>
        </Link>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="font-display font-bold text-5xl xl:text-6xl leading-tight tracking-tight drop-shadow-sm">
            <span className="text-foreground">Study Smarter,</span>
            <br />
            <span className="text-primary">Not Harder.</span>
          </h1>
          <p className="text-foreground/80 text-lg max-w-md">
            Upload your notes and let AI turn them into summaries, quizzes,
            flashcards, and personalized study plans.
          </p>
        </div>

        <div className="relative z-10 text-sm text-foreground/70">
          © {new Date().getFullYear()} StudyMate AI
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-2xl bg-card shadow-xl p-8 sm:p-10 animate-fade-in">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">
                StudyMate <span className="text-primary">AI</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold font-display">Create your account ✨</h1>
            <p className="text-muted-foreground mt-2">Free forever. No credit card needed.</p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/app/dashboard";
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Enter your name" className="pl-9 h-11" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="Enter your email" className="pl-9 h-11" required />
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
            <Button type="submit" className="w-full h-11 bg-gradient-primary hover:opacity-90 shadow-glow">
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
