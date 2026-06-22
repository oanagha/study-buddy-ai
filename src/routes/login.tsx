import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { PinInput } from "@/components/pin-input";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, loginUser, verify2fa, type AuthUser } from "@/lib/api/auth";
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

type LoginStep = "credentials" | "pin";

const inputClass =
  "h-12 rounded-2xl bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 pl-11 focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/50 transition-all";
const labelClass = "text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1";
const primaryBtn =
  "w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:brightness-110 text-white font-semibold shadow-xl shadow-indigo-900/40 transition-all group";

function hasGoogleSignInError(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("google_error") === "1";
}

function readGoogle2faParams(): { tempToken: string; user: AuthUser } | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("requires_2fa") !== "1") return null;
  const tempToken = params.get("temp_token");
  const userRaw = params.get("user");
  if (!tempToken || !userRaw) return null;
  try {
    return { tempToken, user: JSON.parse(userRaw) as AuthUser };
  } catch {
    return null;
  }
}

function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!hasGoogleSignInError()) return;
    toast.error("Google sign-in was cancelled or failed. Please try again.");
    window.history.replaceState({}, "", "/login");
  }, []);

  useEffect(() => {
    const google2fa = readGoogle2faParams();
    if (!google2fa) return;
    setTempToken(google2fa.tempToken);
    setPendingUser(google2fa.user);
    setPin("");
    setStep("pin");
    window.history.replaceState({}, "", "/login");
  }, []);

  async function completeLogin(token: string, user: AuthUser) {
    setAuthSession({ user, token });
    toast.success("Welcome back!");
    await navigate({ to: "/app/dashboard" });
  }

  async function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    setIsSubmitting(true);
    try {
      const result = await loginUser({ email, password });
      if (result.requires_2fa && result.temp_token) {
        setPin("");
        setTempToken(result.temp_token);
        setPendingUser(result.user);
        setStep("pin");
        return;
      }
      if (!result.token) {
        toast.error("Unable to sign in. Please try again.");
        return;
      }
      await completeLogin(result.token, result.user);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) toast.error(err.errors.map((e) => e.message).join(" "));
        else toast.error(err.message);
      } else {
        toast.error("Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePinSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tempToken || !pendingUser) {
      toast.error("Your session expired. Please sign in again.");
      setStep("credentials");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await verify2fa({ temp_token: tempToken, pin: pin.trim() });
      if (!result.token) {
        toast.error("Unable to verify PIN. Please try again.");
        return;
      }
      await completeLogin(result.token, result.user);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          toast.error(err.message);
          if (err.message.toLowerCase().includes("expired")) {
            setStep("credentials");
            setTempToken(null);
            setPendingUser(null);
            setPin("");
          }
        } else if (err.errors?.length) {
          toast.error(err.errors.map((e) => e.message).join(" "));
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Unable to verify PIN. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToLogin() {
    setStep("credentials");
    setTempToken(null);
    setPendingUser(null);
    setPin("");
  }

  if (step === "pin") {
    return (
      <AuthShell
        title="Enter your PIN"
        subtitle={
          pendingUser
            ? `Two-factor authentication is enabled for ${pendingUser.email}.`
            : "Enter your security PIN to continue."
        }
      >
        <form className="space-y-5" onSubmit={handlePinSubmit} autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="pin" className={labelClass}>
              <Shield className="inline w-3.5 h-3.5 mr-1.5" />
              Security PIN
            </Label>
            <PinInput
              id="pin"
              className="h-12 rounded-2xl bg-slate-950/50 border border-white/10 text-white"
              centered
              value={pin}
              onChange={setPin}
              disabled={isSubmitting}
              autoFocus
              autoComplete="one-time-code"
            />
          </div>
          <Button type="submit" className={primaryBtn} disabled={isSubmitting || pin.length < 4}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify PIN
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>
        <Button
          type="button"
          variant="ghost"
          className="w-full mt-4 text-slate-400 hover:text-white hover:bg-white/5"
          disabled={isSubmitting}
          onClick={handleBackToLogin}
        >
          Back to sign in
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account to continue learning">
      <form className="space-y-5" onSubmit={handleCredentialsSubmit} autoComplete="off">
        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10 pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@university.edu"
              className={inputClass}
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
              className={inputClass}
              autoComplete="off"
              readOnlyUntilFocus
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <Button type="submit" className={primaryBtn} disabled={isSubmitting}>
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

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-900/80 backdrop-blur-md px-4 text-slate-500 uppercase tracking-widest font-medium rounded-full">
            or continue with
          </span>
        </div>
      </div>

      <GoogleSignInButton disabled={isSubmitting} />

      <p className="mt-8 text-center text-sm text-slate-400 font-medium">
        New to StudyMate AI?{" "}
        <Link
          to="/register"
          className="text-indigo-400 hover:text-indigo-300 ml-1 font-semibold transition-colors"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
