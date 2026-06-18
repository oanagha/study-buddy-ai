import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api/config";
import { ApiError } from "@/lib/api/auth";
import { getAuthToken, isTokenExpired, clearAuthUser } from "@/lib/auth";

type ReportPreviewSearch = {
  path?: string;
};

export const Route = createFileRoute("/report-preview")({
  validateSearch: (search: Record<string, unknown>): ReportPreviewSearch => ({
    path: typeof search.path === "string" ? search.path : undefined,
  }),
  head: () => ({
    meta: [
      { title: "StudyMate AI Progress & Analytics Report" },
      { name: "description", content: "Your StudyMate AI learning progress and analytics report." },
    ],
    links: [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
  }),
  beforeLoad: ({ search }) => {
    if (typeof window === "undefined") return;

    if (!getAuthToken() || isTokenExpired(getAuthToken() ?? "")) {
      throw redirect({ to: "/login" });
    }

    if (!search.path) {
      throw redirect({ to: "/app/settings" });
    }
  },
  component: ReportPreview,
});

function ReportPreview() {
  const { path } = Route.useSearch();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadPdf() {
      const token = getAuthToken();
      if (!token || isTokenExpired(token)) {
        clearAuthUser();
        setError("Your session has expired. Please sign in again.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}${path}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new ApiError(response.status, data.message ?? "Failed to load report");
        }

        const blob = await response.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load report.");
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Opening your report...
        </div>
      </div>
    );
  }

  return (
    <iframe
      title="StudyMate AI Progress & Analytics Report"
      src={pdfUrl}
      className="h-screen w-full border-0 bg-white"
    />
  );
}
