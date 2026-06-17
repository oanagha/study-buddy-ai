import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthHeader } from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, loginUser } from "@/lib/api/auth";
import { isAuthenticated, setAuthSession } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — StudyMate AI" }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;

    if (isAuthenticated()) {
      throw redirect({ to: "/app/dashboard" });
    }
  },
  component: Login,
});

function hasGoogleSignInError(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("google_error") === "1";
}

function Login() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasGoogleSignInError()) return;

    toast.error("Google sign-in was cancelled or failed. Please try again.");
    window.history.replaceState({}, "", "/login");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    setIsSubmitting(true);

    try {
      const { token, user } = await loginUser({ email, password });

      setAuthSession({ user, token });
      toast.success("Welcome back!");
      await navigate({ to: "/app/dashboard" });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          toast.error(err.errors.map((e) => e.message).join(" "));
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground/80">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@university.edu"
                  className="pl-10 h-11 bg-card"
                  required
                  disabled={isSubmitting}
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
                  placeholder="Enter your password"
                  className="pl-10 h-11 bg-card"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-primary hover:opacity-95 shadow-glow group"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
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

          <GoogleSignInButton disabled={isSubmitting} />

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
