import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoadingState } from "@/components/loading-spinner";
import type { AuthUser } from "@/lib/api/auth";
import { setAuthSession } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/google/callback")({
  head: () => ({ meta: [{ title: "Signing in — StudyMate AI" }] }),
  component: GoogleCallback,
});

function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const userRaw = params.get("user");

    if (!token || !userRaw) {
      toast.error("Google sign-in failed. Please try again.");
      void navigate({ to: "/login", replace: true });
      return;
    }

    try {
      const user = JSON.parse(userRaw) as AuthUser;
      setAuthSession({ user, token });
      toast.success("Signed in with Google!");
      void navigate({ to: "/app/dashboard", replace: true });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      void navigate({ to: "/login", replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingState label="Completing Google sign-in" className="text-muted-foreground" />
    </div>
  );
}
