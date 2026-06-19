import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  FileText,
  ArrowLeft,
  Copy,
  FileType,
  File as FileIcon,
  FileCode,
  Loader2,
  Eye,
  History,
} from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { LoadingState } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api/auth";
import { refreshNotificationsAfterActivity } from "@/lib/notifications";
import { fetchSummary, summarizeNote, type SummaryResult } from "@/lib/api/ai";
import { fetchNotes, type Note } from "@/lib/api/notes";
import { toast } from "sonner";

type SummariesSearch = {
  noteId?: number;
};

export const Route = createFileRoute("/app/summaries")({
  validateSearch: (search: Record<string, unknown>): SummariesSearch => {
    const raw = search.noteId;
    if (raw === undefined || raw === null || raw === "") return {};
    const noteId = Number(raw);
    return Number.isInteger(noteId) && noteId > 0 ? { noteId } : {};
  },
  head: () => ({ meta: [{ title: "AI Summaries — StudyMate AI" }] }),
  component: Summaries,
});

const fileIcons: Record<string, typeof FileText> = { pdf: FileType, docx: FileIcon, txt: FileCode };

function formatGeneratedAt(dateString?: string | null) {
  if (!dateString) return "Generated just now";
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "Generated just now";
  if (diffMins < 60) return `Generated ${diffMins} min ago`;
  return date.toLocaleString();
}

function formatHistoryDate(dateString?: string | null) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SummaryView({
  note,
  summary,
  onBack,
  onRegenerate,
  isGenerating,
}: {
  note: Note;
  summary: SummaryResult;
  onBack: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}) {
  const copySummary = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft className="h-4 w-4" /> Back to notes
      </Button>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display">{note.fileName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI summary • {formatGeneratedAt(summary.generated_at)}
            {summary.cached ? " • cached" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isGenerating}
            onClick={() => void copySummary(summary.short_summary)}
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button
            size="sm"
            className="bg-gradient-primary hover:opacity-90"
            disabled={isGenerating}
            onClick={onRegenerate}
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Regenerate
          </Button>
        </div>
      </div>
      <Card className="p-6 sm:p-8 shadow-card border-border/50">
        <Tabs defaultValue="short">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="short">Short Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Summary</TabsTrigger>
            <TabsTrigger value="key">Key Points</TabsTrigger>
          </TabsList>
          <TabsContent value="short" className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-foreground/90">{summary.short_summary}</p>
          </TabsContent>
          <TabsContent value="detailed">
            <div className="space-y-4 text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {summary.detailed_summary}
            </div>
          </TabsContent>
          <TabsContent value="key">
            <ul className="space-y-3">
              {summary.key_points.map((point, i) => (
                <li key={i} className="flex gap-3 p-3 rounded-lg bg-muted/40">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function Summaries() {
  const { noteId: urlNoteId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [generatingNoteId, setGeneratingNoteId] = useState<number | null>(null);

  const setNoteInUrl = useCallback(
    (noteId?: number) => {
      void navigate({
        search: noteId ? { noteId } : {},
        replace: true,
      });
    },
    [navigate],
  );

  const markNoteHasSummary = useCallback((noteId: number, generatedAt?: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.noteId === noteId
          ? { ...n, hasSummary: true, summaryGeneratedAt: generatedAt ?? n.summaryGeneratedAt }
          : n,
      ),
    );
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to load notes.");
      }
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const openSummary = useCallback(
    async (note: Note, options?: { forceRegenerate?: boolean }) => {
      const forceRegenerate = options?.forceRegenerate ?? false;
      setGeneratingNoteId(note.noteId);
      setNoteInUrl(note.noteId);

      try {
        const result = forceRegenerate
          ? await summarizeNote(note.noteId, { forceRegenerate: true })
          : note.hasSummary
            ? await fetchSummary(note.noteId)
            : await summarizeNote(note.noteId);

        setActiveNote(note);
        setSummary(result);
        markNoteHasSummary(note.noteId, result.generated_at);

        if (forceRegenerate) {
          toast.success("Summary regenerated successfully!");
          refreshNotificationsAfterActivity();
        } else if (result.cached || note.hasSummary) {
          toast.success("Summary loaded from history.");
        } else {
          toast.success("Summary generated successfully!");
          refreshNotificationsAfterActivity();
        }
      } catch (err) {
        setNoteInUrl(undefined);
        if (err instanceof ApiError) {
          toast.error(err.message);
        } else {
          toast.error("Failed to load summary.");
        }
      } finally {
        setGeneratingNoteId(null);
      }
    },
    [markNoteHasSummary, setNoteInUrl],
  );

  useEffect(() => {
    if (!urlNoteId || loadingNotes || notes.length === 0) return;
    if (generatingNoteId === urlNoteId) return;
    if (activeNote?.noteId === urlNoteId && summary) return;

    const note = notes.find((n) => n.noteId === urlNoteId);
    if (!note) {
      setNoteInUrl(undefined);
      return;
    }

    if (!note.hasSummary) {
      void openSummary(note);
      return;
    }

    let cancelled = false;
    setLoadingDetail(true);

    fetchSummary(urlNoteId)
      .then((result) => {
        if (cancelled) return;
        setActiveNote(note);
        setSummary(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setNoteInUrl(undefined);
        if (err instanceof ApiError) {
          toast.error(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    urlNoteId,
    loadingNotes,
    notes,
    activeNote?.noteId,
    summary,
    generatingNoteId,
    setNoteInUrl,
    openSummary,
  ]);

  const handleBack = () => {
    setActiveNote(null);
    setSummary(null);
    setNoteInUrl(undefined);
  };

  if (loadingDetail) {
    return <LoadingState label="Loading summary" className="py-16 text-muted-foreground" />;
  }

  if (activeNote && summary) {
    return (
      <SummaryView
        note={activeNote}
        summary={summary}
        onBack={handleBack}
        onRegenerate={() => openSummary(activeNote, { forceRegenerate: true })}
        isGenerating={generatingNoteId === activeNote.noteId}
      />
    );
  }

  const historyNotes = notes.filter((n) => n.hasSummary);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="AI Summaries"
        subtitle="Pick a note to generate or view a saved AI summary."
      />

      {loadingNotes ? (
        <LoadingState label="Loading notes" className="py-16 text-muted-foreground" />
      ) : notes.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No notes uploaded yet. Upload a PDF, DOCX, or TXT file first to generate summaries.
        </Card>
      ) : (
        <>
          {historyNotes.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <History className="h-4 w-4" />
                Saved summaries ({historyNotes.length})
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {historyNotes.map((note) => (
                  <Card
                    key={`history-${note.noteId}`}
                    className="p-4 border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => void openSummary(note)}
                  >
                    <p className="font-medium text-sm truncate">{note.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatHistoryDate(note.summaryGeneratedAt)}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => {
              const Icon = fileIcons[note.fileType] ?? FileText;
              const isGenerating = generatingNoteId === note.noteId;

              return (
                <Card
                  key={note.noteId}
                  className="p-5 shadow-card hover:shadow-glow/40 hover:-translate-y-0.5 transition-all border-border/50"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm truncate">{note.fileName}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-xs text-muted-foreground uppercase">{note.fileType}</p>
                    {note.hasSummary && (
                      <Badge variant="secondary" className="text-xs">
                        Summary saved
                      </Badge>
                    )}
                  </div>
                  {note.hasSummary ? (
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1 bg-gradient-primary hover:opacity-90"
                        disabled={isGenerating || generatingNoteId !== null}
                        onClick={() => void openSummary(note)}
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Eye className="h-4 w-4" /> View
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={isGenerating || generatingNoteId !== null}
                        title="Regenerate summary"
                        onClick={() => void openSummary(note, { forceRegenerate: true })}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full mt-4 bg-gradient-primary hover:opacity-90"
                      disabled={isGenerating || generatingNoteId !== null}
                      onClick={() => void openSummary(note)}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> Generate Summary
                        </>
                      )}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
