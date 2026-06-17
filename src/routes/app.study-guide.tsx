import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  FileText,
  ArrowLeft,
  Loader2,
  FileType,
  File as FileIcon,
  FileCode,
  BookOpen,
  Target,
  ListChecks,
  GraduationCap,
  HelpCircle,
  Eye,
  History,
} from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ApiError } from "@/lib/api/auth";
import {
  fetchStudyMaterial,
  generateStudyMaterial,
  type StudyMaterialResult,
  type StudyTopic,
} from "@/lib/api/ai";
import { fetchNotes, type Note } from "@/lib/api/notes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StudyGuideSearch = {
  noteId?: number;
};

export const Route = createFileRoute("/app/study-guide")({
  validateSearch: (search: Record<string, unknown>): StudyGuideSearch => {
    const raw = search.noteId;
    if (raw === undefined || raw === null || raw === "") return {};
    const noteId = Number(raw);
    return Number.isInteger(noteId) && noteId > 0 ? { noteId } : {};
  },
  head: () => ({ meta: [{ title: "Study Guide — StudyMate AI" }] }),
  component: StudyGuide,
});

const fileIcons: Record<string, typeof FileText> = { pdf: FileType, docx: FileIcon, txt: FileCode };

const importanceStyles: Record<StudyTopic["importance"], string> = {
  high: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

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

function TopicCard({ topic, index }: { topic: StudyTopic; index: number }) {
  return (
    <AccordionItem value={`topic-${index}`} className="border-border/50">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-start gap-3 text-left flex-1 min-w-0">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{topic.title}</span>
              <Badge variant="outline" className={cn("text-xs capitalize", importanceStyles[topic.importance])}>
                {topic.importance} priority
              </Badge>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4 pl-10 space-y-3">
        <p className="leading-relaxed text-foreground/90">{topic.summary}</p>
        {topic.key_terms.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Key terms</p>
            <div className="flex flex-wrap gap-1.5">
              {topic.key_terms.map((term) => (
                <Badge key={term} variant="secondary" className="text-xs">
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {topic.exam_tips && (
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs font-semibold text-primary mb-1">Exam tip</p>
            <p className="text-sm leading-relaxed">{topic.exam_tips}</p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function StudyMaterialView({
  note,
  material,
  onBack,
  onRegenerate,
  isGenerating,
}: {
  note: Note;
  material: StudyMaterialResult;
  onBack: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}) {
  const highTopics = material.all_topics.filter((t) => t.importance === "high");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft className="h-4 w-4" /> Back to notes
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display">{note.fileName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Study guide • {formatGeneratedAt(material.generated_at)}
            {material.cached ? " • cached" : ""}
            {" • "}
            {material.all_topics.length} topics
          </p>
        </div>
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

      {highTopics.length > 0 && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Start here — high priority topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {highTopics.map((topic) => (
              <Badge key={topic.title} className="bg-gradient-primary text-primary-foreground">
                {topic.title}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 sm:p-8 shadow-card border-border/50">
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 mb-6 h-auto gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="exam" className="text-xs sm:text-sm">Exam Focus</TabsTrigger>
            <TabsTrigger value="topics" className="text-xs sm:text-sm">All Topics</TabsTrigger>
            <TabsTrigger value="plan" className="text-xs sm:text-sm">Study Plan</TabsTrigger>
            <TabsTrigger value="practice" className="text-xs sm:text-sm">Practice</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Document Overview</h3>
            </div>
            <p className="leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {material.document_overview}
            </p>
          </TabsContent>

          <TabsContent value="exam" className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-red-500" />
                <h3 className="font-semibold">Must Know</h3>
              </div>
              <ul className="space-y-2">
                {material.exam_focus.must_know.map((item, i) => (
                  <li key={i} className="flex gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-500 font-bold shrink-0">!</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold">Likely Exam Topics</h3>
              </div>
              <ul className="space-y-2">
                {material.exam_focus.likely_exam_topics.map((item, i) => (
                  <li key={i} className="flex gap-3 p-3 rounded-lg bg-muted/40">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Quick Revision Checklist</h3>
              </div>
              <ul className="space-y-2">
                {material.exam_focus.quick_revision_checklist.map((item, i) => (
                  <li key={i} className="flex gap-2 items-start text-sm leading-relaxed">
                    <span className="mt-0.5 text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="topics">
            <p className="text-sm text-muted-foreground mb-4">
              Complete topic coverage from your document — expand each section to study in detail.
            </p>
            <Accordion type="multiple" className="w-full">
              {material.all_topics.map((topic, i) => (
                <TopicCard key={`${topic.title}-${i}`} topic={topic} index={i} />
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="plan">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Suggested Study Plan</h3>
            </div>
            <ol className="space-y-3">
              {material.study_plan.map((step, i) => (
                <li key={i} className="flex gap-3 p-4 rounded-lg bg-muted/40">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="practice">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Practice Questions</h3>
            </div>
            <div className="space-y-4">
              {material.practice_questions.map((q, i) => (
                <Card key={i} className="p-4 border-border/50">
                  <p className="font-medium mb-2">
                    <span className="text-primary mr-2">Q{i + 1}.</span>
                    {q.question}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground/70">Hint: </span>
                    {q.answer_hint}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function StudyGuide() {
  const { noteId: urlNoteId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [material, setMaterial] = useState<StudyMaterialResult | null>(null);
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

  const markNoteHasStudyMaterial = useCallback((noteId: number, generatedAt?: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.noteId === noteId
          ? {
              ...n,
              hasStudyMaterial: true,
              studyMaterialGeneratedAt: generatedAt ?? n.studyMaterialGeneratedAt,
            }
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

  const openStudyGuide = useCallback(
    async (note: Note, options?: { forceRegenerate?: boolean }) => {
      const forceRegenerate = options?.forceRegenerate ?? false;
      setGeneratingNoteId(note.noteId);
      setNoteInUrl(note.noteId);

      try {
        const result = forceRegenerate
          ? await generateStudyMaterial(note.noteId, { forceRegenerate: true })
          : note.hasStudyMaterial
            ? await fetchStudyMaterial(note.noteId)
            : await generateStudyMaterial(note.noteId);

        setActiveNote(note);
        setMaterial(result);
        markNoteHasStudyMaterial(note.noteId, result.generated_at);

        if (forceRegenerate) {
          toast.success("Study guide regenerated successfully!");
        } else if (result.cached || note.hasStudyMaterial) {
          toast.success("Study guide loaded from history.");
        } else {
          toast.success("Study guide generated successfully!");
        }
      } catch (err) {
        setNoteInUrl(undefined);
        if (err instanceof ApiError) {
          toast.error(err.message);
        } else {
          toast.error("Failed to load study guide.");
        }
      } finally {
        setGeneratingNoteId(null);
      }
    },
    [markNoteHasStudyMaterial, setNoteInUrl],
  );

  useEffect(() => {
    if (!urlNoteId || loadingNotes || notes.length === 0) return;
    if (generatingNoteId === urlNoteId) return;
    if (activeNote?.noteId === urlNoteId && material) return;

    const note = notes.find((n) => n.noteId === urlNoteId);
    if (!note) {
      setNoteInUrl(undefined);
      return;
    }

    if (!note.hasStudyMaterial) {
      void openStudyGuide(note);
      return;
    }

    let cancelled = false;
    setLoadingDetail(true);

    fetchStudyMaterial(urlNoteId)
      .then((result) => {
        if (cancelled) return;
        setActiveNote(note);
        setMaterial(result);
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
  }, [urlNoteId, loadingNotes, notes, activeNote?.noteId, material, generatingNoteId, setNoteInUrl, openStudyGuide]);

  const handleBack = () => {
    setActiveNote(null);
    setMaterial(null);
    setNoteInUrl(undefined);
  };

  if (loadingDetail) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading saved study guide...
      </div>
    );
  }

  if (activeNote && material) {
    return (
      <StudyMaterialView
        note={activeNote}
        material={material}
        onBack={handleBack}
        onRegenerate={() => openStudyGuide(activeNote, { forceRegenerate: true })}
        isGenerating={generatingNoteId === activeNote.noteId}
      />
    );
  }

  const historyNotes = notes.filter((n) => n.hasStudyMaterial);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Study Guide"
        subtitle="Generate or view saved exam-ready study material for your notes."
      />

      {loadingNotes ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your notes...
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No notes uploaded yet. Upload a PDF, DOCX, or TXT file first to generate a study guide.
        </Card>
      ) : (
        <>
          {historyNotes.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <History className="h-4 w-4" />
                Saved study guides ({historyNotes.length})
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {historyNotes.map((note) => (
                  <Card
                    key={`history-${note.noteId}`}
                    className="p-4 border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => void openStudyGuide(note)}
                  >
                    <p className="font-medium text-sm truncate">{note.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatHistoryDate(note.studyMaterialGeneratedAt)}
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
                    {note.hasStudyMaterial && (
                      <Badge variant="secondary" className="text-xs">
                        Guide saved
                      </Badge>
                    )}
                  </div>
                  {note.hasStudyMaterial ? (
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1 bg-gradient-primary hover:opacity-90"
                        disabled={isGenerating || generatingNoteId !== null}
                        onClick={() => void openStudyGuide(note)}
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
                        title="Regenerate study guide"
                        onClick={() => void openStudyGuide(note, { forceRegenerate: true })}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full mt-4 bg-gradient-primary hover:opacity-90"
                      disabled={isGenerating || generatingNoteId !== null}
                      onClick={() => void openStudyGuide(note)}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4" /> Generate Study Guide
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
