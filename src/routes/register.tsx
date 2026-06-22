import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, registerUser } from "@/lib/api/auth";
import { isAuthenticated, setAuthSession } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up — StudyMate AI" }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (isAuthenticated()) {
      throw redirect({ to: "/app/dashboard" });
    }
  },
  component: Register,
});

const inputClass =
  "h-10 sm:h-11 rounded-xl bg-white/80 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/50 transition-all";
const inputWithIcon = `${inputClass} pl-10`;
const labelClass = "text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1";
const primaryBtn =
  "w-full h-10 sm:h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:brightness-110 text-white font-semibold shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/40 transition-all group";

function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value.trim();
    const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await registerUser({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      });
      setAuthSession({ user });
      toast.success("Account created successfully!");
      await navigate({ to: "/app/dashboard" });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) toast.error(err.errors.map((e) => e.message).join(" "));
        else toast.error(err.message);
      } else {
        toast.error("Unable to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever — no credit card required"
    >
      <form className="space-y-2.5" onSubmit={handleSubmit} autoComplete="off">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className={labelClass}>
              First name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Jane"
              className={`${inputClass} px-4`}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className={labelClass}>
              Last name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              className={`${inputClass} px-4`}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10 pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@university.edu"
              className={inputWithIcon}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className={labelClass}>
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10 pointer-events-none" />
            <PasswordInput
              id="password"
              name="password"
              className={inputWithIcon}
              autoComplete="off"
              readOnlyUntilFocus
              minLength={8}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className={labelClass}>
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10 pointer-events-none" />
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              className={inputWithIcon}
              autoComplete="off"
              readOnlyUntilFocus
              minLength={8}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <Button type="submit" className={`${primaryBtn} mt-2`} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center leading-relaxed">
          By signing up, you agree to our{" "}
          <a href="#" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 text-slate-500 uppercase tracking-widest font-medium rounded-full">
            or continue with
          </span>
        </div>
      </div>

      <GoogleSignInButton disabled={isSubmitting} />

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 ml-1 font-semibold transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
