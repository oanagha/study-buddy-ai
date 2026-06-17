import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { hasValidClientSession } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    // localStorage is unavailable during SSR — defer auth check to the client
    if (typeof window === "undefined") return;

    if (!hasValidClientSession()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
