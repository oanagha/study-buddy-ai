import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthHeader } from "@/components/auth-header";
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
      <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background flex flex-col">
        <AuthHeader />

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-xl p-6 sm:p-8 animate-fade-in">
            <div className="mb-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-semibold font-display tracking-tight">Enter your PIN</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {pendingUser
                  ? `Two-factor authentication is enabled for ${pendingUser.email}.`
                  : "Enter your security PIN to continue."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handlePinSubmit} autoComplete="off">
              <div className="space-y-1.5">
                <Label htmlFor="pin" className="text-xs font-medium text-foreground/80">
                  Security PIN
                </Label>
                <PinInput
                  id="pin"
                  className="h-11 bg-card"
                  centered
                  value={pin}
                  onChange={setPin}
                  disabled={isSubmitting}
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-primary hover:opacity-95 shadow-glow group"
                disabled={isSubmitting || pin.length < 4}
              >
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
              className="w-full mt-4"
              disabled={isSubmitting}
              onClick={handleBackToLogin}
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
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

          <form className="space-y-5" onSubmit={handleCredentialsSubmit} autoComplete="off">
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
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                <PasswordInput
                  id="password"
                  name="password"
                  className="pl-10 h-11 bg-card"
                  autoComplete="off"
                  readOnlyUntilFocus
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
