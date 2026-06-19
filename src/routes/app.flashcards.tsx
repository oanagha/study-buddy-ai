import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Check,
  Layers,
  Loader2,
  Sparkles,
  ArrowLeft,
  FileText,
  FileType,
  File as FileIcon,
  FileCode,
  RotateCcw,
  Eye,
  EyeOff,
  Trophy,
  XCircle,
  Brain,
} from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { LoadingState } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/auth";
import { refreshNotificationsAfterActivity } from "@/lib/notifications";
import { fetchFlashcards, generateFlashcards, type Flashcard } from "@/lib/api/flashcards";
import { type Note } from "@/lib/api/notes";
import { useNotesQuery } from "@/lib/queries/hooks";
import { patchNotesCache } from "@/lib/queries/invalidate";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FlashcardSearch = {
  noteId?: number;
};

type DeckCard = Flashcard & { id: string };
type FlashcardStage = "learn" | "recall" | "complete";

export const Route = createFileRoute("/app/flashcards")({
  validateSearch: (search: Record<string, unknown>): FlashcardSearch => {
    const raw = search.noteId;
    if (raw === undefined || raw === null || raw === "") return {};
    const noteId = Number(raw);
    return Number.isInteger(noteId) && noteId > 0 ? { noteId } : {};
  },
  head: () => ({ meta: [{ title: "Flashcards — StudyMate AI" }] }),
  component: Flashcards,
});

const fileIcons: Record<string, typeof FileText> = { pdf: FileType, docx: FileIcon, txt: FileCode };
const CARD_COUNTS = [5, 10, 15, 20, 25, 30, 40, 50];
const BATCH_SIZE = 20;

function shuffleDeck<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function getCompletionMessage(score: number) {
  if (score >= 90) return "Outstanding recall — you've got real mastery!";
  if (score >= 70) return "Solid work — keep sharpening those cards.";
  if (score >= 50) return "Good effort — a quick rewind will boost your power.";
  return "Keep going — repetition is how memory sticks.";
}

function Flashcards() {
  const queryClient = useQueryClient();
  const { noteId: urlNoteId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: notes = [], isPending: loadingNotes, error: notesError } = useNotesQuery();
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(urlNoteId ?? null);
  const [cardCount, setCardCount] = useState(20);
  const [deck, setDeck] = useState<DeckCard[]>([]);
  const [activeNoteName, setActiveNoteName] = useState<string | null>(null);
  const [hasDeck, setHasDeck] = useState(false);
  const [stage, setStage] = useState<FlashcardStage>("learn");
  const [batchStart, setBatchStart] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [recallQueue, setRecallQueue] = useState<DeckCard[]>([]);
  const [recallRevealed, setRecallRevealed] = useState(false);
  const [recallMastered, setRecallMastered] = useState<Set<string>>(new Set());
  const [recallFirstPass, setRecallFirstPass] = useState<Set<string>>(new Set());
  const [recallSeen, setRecallSeen] = useState<Set<string>>(new Set());
  const [batchScore, setBatchScore] = useState(0);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const skipAutoLoadRef = useRef(false);
  const recallStartedRef = useRef(false);

  const selectedNote = notes.find((n) => n.noteId === selectedNoteId) ?? null;

  const currentBatch = useMemo(
    () => deck.slice(batchStart, batchStart + BATCH_SIZE),
    [deck, batchStart],
  );

  const batchLearnedCount = useMemo(
    () => currentBatch.filter((c) => learned.has(c.id)).length,
    [currentBatch, learned],
  );

  const hasNextBatch = batchStart + BATCH_SIZE < deck.length;
  const batchNumber = Math.floor(batchStart / BATCH_SIZE) + 1;
  const totalBatches = Math.max(1, Math.ceil(deck.length / BATCH_SIZE));

  const card = deck[index];
  const recallCard = recallQueue[0] ?? null;

  useEffect(() => {
    if (notes.length === 0) return;
    if (urlNoteId && notes.some((n) => n.noteId === urlNoteId)) {
      setSelectedNoteId(urlNoteId);
      return;
    }
    setSelectedNoteId((current) => current ?? notes[0].noteId);
  }, [notes, urlNoteId]);

  useEffect(() => {
    if (notesError instanceof ApiError) {
      toast.error(notesError.message);
    } else if (notesError) {
      toast.error("Failed to load notes.");
    }
  }, [notesError]);

  const resetSessionState = useCallback(() => {
    setStage("learn");
    setBatchStart(0);
    setIndex(0);
    setFlipped(false);
    setLearned(new Set());
    setRecallQueue([]);
    setRecallRevealed(false);
    setRecallMastered(new Set());
    setRecallFirstPass(new Set());
    setRecallSeen(new Set());
    setBatchScore(0);
    setShowCompleteDialog(false);
    recallStartedRef.current = false;
  }, []);

  const startRecall = useCallback((batch: DeckCard[]) => {
    if (batch.length === 0 || recallStartedRef.current) return;
    recallStartedRef.current = true;
    setRecallQueue(shuffleDeck(batch));
    setRecallRevealed(false);
    setRecallMastered(new Set());
    setRecallFirstPass(new Set());
    setRecallSeen(new Set());
    setStage("recall");
    toast.success("Batch learned! Time to test your recall — no peeking.");
  }, []);

  const finishRecall = useCallback(
    (firstPass: Set<string>, batch: DeckCard[]) => {
      const score =
        batch.length > 0 ? Math.round((firstPass.size / batch.length) * 100) : 100;
      setBatchScore(score);
      setStage("complete");
      setShowCompleteDialog(true);
      setRecallQueue([]);
      setRecallRevealed(false);
    },
    [],
  );

  useEffect(() => {
    if (stage !== "learn" || currentBatch.length === 0) return;
    if (batchLearnedCount < currentBatch.length) return;
    startRecall(currentBatch);
  }, [stage, currentBatch, batchLearnedCount, startRecall]);

  const handleSelectNote = (noteId: string) => {
    const id = Number(noteId);
    setSelectedNoteId(id);
    void navigate({ search: { noteId: id }, replace: true });
  };

  const applyDeck = (note: Note, result: { flashcards: Flashcard[]; flashcard_set_id?: number }) => {
    const setId = result.flashcard_set_id ?? Date.now();
    const newDeck = result.flashcards.map((fc, i) => ({
      ...fc,
      id: `${setId}-${i}`,
    }));

    setDeck(newDeck);
    setActiveNoteName(note.fileName);
    setHasDeck(newDeck.length > 0);
    resetSessionState();
    return newDeck.length;
  };

  const handleLoadSaved = useCallback(async (note: Note) => {
    setLoadingSaved(true);

    try {
      const result = await fetchFlashcards(note.noteId);
      const count = applyDeck(note, result);

      if (count === 0) {
        toast.info("No saved flashcards for this note yet. Generate a new deck.");
      } else {
        toast.success(`Loaded ${count} saved flashcards.`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to load saved flashcards.");
      }
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (!selectedNote) {
      toast.error("Please select a note first.");
      return;
    }

    setGenerating(true);

    try {
      const result = await generateFlashcards(selectedNote.noteId, cardCount);
      const count = applyDeck(selectedNote, result);

      if (count === 0) {
        toast.error("No flashcards were returned.");
        return;
      }

      patchNotesCache(queryClient, (prev) =>
        prev.map((n) => (n.noteId === selectedNote.noteId ? { ...n, hasFlashcards: true } : n)),
      );

      if (result.cached) {
        toast.success("Flashcards loaded from cache.");
      } else {
        toast.success("Flashcards generated successfully!");
        refreshNotificationsAfterActivity();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to generate flashcards.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % deck.length);
  };

  const prev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + deck.length) % deck.length);
  };

  const shuffle = () => {
    setFlipped(false);
    setIndex(0);
    setDeck((d) => shuffleDeck(d));
  };

  const mark = () => {
    if (!card) return;
    setLearned((s) => new Set(s).add(card.id));
    setTimeout(next, 300);
  };

  const handleRecallGotIt = () => {
    if (!recallCard) return;

    const isFirstSeen = !recallSeen.has(recallCard.id);
    const nextMastered = new Set(recallMastered).add(recallCard.id);
    const nextFirstPass = isFirstSeen
      ? new Set(recallFirstPass).add(recallCard.id)
      : recallFirstPass;
    const nextSeen = new Set(recallSeen).add(recallCard.id);
    const remaining = recallQueue.slice(1);

    setRecallMastered(nextMastered);
    setRecallFirstPass(nextFirstPass);
    setRecallSeen(nextSeen);
    setRecallRevealed(false);

    if (nextMastered.size >= currentBatch.length) {
      finishRecall(nextFirstPass, currentBatch);
      return;
    }

    if (remaining.length === 0) {
      const rewind = currentBatch.filter((c) => !nextMastered.has(c.id));
      if (rewind.length === 0) {
        finishRecall(nextFirstPass, currentBatch);
      } else {
        setRecallQueue(shuffleDeck(rewind));
        toast.info("Rewinding missed cards — you've got this!");
      }
      return;
    }

    setRecallQueue(remaining);
  };

  const handleRecallMissed = () => {
    if (!recallCard) return;

    const nextSeen = new Set(recallSeen).add(recallCard.id);
    const remaining = recallQueue.slice(1);
    const requeued = [...remaining, recallCard];

    setRecallSeen(nextSeen);
    setRecallRevealed(false);
    setRecallQueue(requeued);
  };

  const startNextBatch = () => {
    if (!hasNextBatch) {
      resetDeck();
      return;
    }

    const nextStart = batchStart + BATCH_SIZE;
    setBatchStart(nextStart);
    setIndex(nextStart);
    setFlipped(false);
    setStage("learn");
    setRecallQueue([]);
    setRecallRevealed(false);
    setRecallMastered(new Set());
    setRecallFirstPass(new Set());
    setRecallSeen(new Set());
    setBatchScore(0);
    setShowCompleteDialog(false);
    recallStartedRef.current = false;
    toast.success(`Starting batch ${batchNumber + 1} of ${totalBatches}.`);
  };

  const reviewMissedInBatch = () => {
    const missed = currentBatch.filter((c) => !recallFirstPass.has(c.id));
    if (missed.length === 0) {
      startNextBatch();
      return;
    }

    setShowCompleteDialog(false);
    setStage("recall");
    setRecallQueue(shuffleDeck(missed));
    setRecallRevealed(false);
    setRecallMastered(new Set());
    setRecallFirstPass(new Set());
    setRecallSeen(new Set());
    recallStartedRef.current = true;
    toast.info(`Reviewing ${missed.length} card${missed.length === 1 ? "" : "s"} you missed.`);
  };

  useEffect(() => {
    if (!urlNoteId || loadingNotes || notes.length === 0) return;
    if (skipAutoLoadRef.current) {
      skipAutoLoadRef.current = false;
      return;
    }

    const note = notes.find((n) => n.noteId === urlNoteId);
    if (!note?.hasFlashcards || hasDeck) return;

    void handleLoadSaved(note);
  }, [urlNoteId, loadingNotes, notes, hasDeck, handleLoadSaved]);

  const resetDeck = () => {
    skipAutoLoadRef.current = true;
    setLoadingSaved(false);
    setHasDeck(false);
    setDeck([]);
    setActiveNoteName(null);
    resetSessionState();
    void navigate({ search: {}, replace: true });
  };

  if (loadingSaved) {
    return <LoadingState label="Loading flashcards" className="py-16 text-muted-foreground" />;
  }

  if (!hasDeck || deck.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Flashcards"
          subtitle="Generate AI flashcards from your uploaded notes."
        />

        {loadingNotes ? (
          <LoadingState label="Loading notes" className="py-16 text-muted-foreground" />
        ) : notes.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No notes uploaded yet. Upload a PDF, DOCX, or TXT file first to generate flashcards.
          </Card>
        ) : (
          <Card className="p-8 shadow-card border-border/50 space-y-6">
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow mb-4">
                <Layers className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold">Generate Flashcards</h2>
              <p className="text-muted-foreground mt-1">Pick a note and how many cards you want</p>
            </div>

            <div className="space-y-2">
              <Label>Select note</Label>
              <Select
                value={selectedNoteId ? String(selectedNoteId) : undefined}
                onValueChange={handleSelectNote}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a note" />
                </SelectTrigger>
                <SelectContent>
                  {notes.map((note) => {
                    const Icon = fileIcons[note.fileType] ?? FileText;
                    return (
                      <SelectItem key={note.noteId} value={String(note.noteId)}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0" />
                          {note.fileName}
                          {note.hasFlashcards && (
                            <Badge variant="secondary" className="text-xs ml-1">
                              saved
                            </Badge>
                          )}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of cards</Label>
              <Select value={String(cardCount)} onValueChange={(v) => setCardCount(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_COUNTS.map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count} cards
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              {selectedNote?.hasFlashcards && (
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  disabled={loadingSaved || generating || !selectedNote}
                  onClick={() => selectedNote && void handleLoadSaved(selectedNote)}
                >
                  <Eye className="h-4 w-4" />
                  View Saved Deck
                </Button>
              )}
              <Button
                className="flex-1 h-12 bg-gradient-primary hover:opacity-90 shadow-glow text-base"
                disabled={generating || loadingSaved || !selectedNote}
                onClick={() => void handleGenerate()}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {selectedNote?.hasFlashcards ? "Generate New Deck" : "Generate Flashcards"}
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (stage === "recall" && recallCard) {
    const recallProgress =
      currentBatch.length > 0
        ? Math.round((recallMastered.size / currentBatch.length) * 100)
        : 0;

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={resetDeck} className="-ml-3">
          <ArrowLeft className="h-4 w-4" /> Back to generator
        </Button>
        <PageHeader
          title="Recall Test"
          subtitle={`Batch ${batchNumber} — answer from memory before revealing`}
          action={
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
              <Brain className="h-3.5 w-3.5 mr-1" />
              {recallMastered.size}/{currentBatch.length} mastered
            </Badge>
          }
        />

        <Progress value={recallProgress} className="h-2" />

        <Card className="p-8 sm:p-12 shadow-glow border-border/50 min-h-80 flex flex-col items-center justify-center text-center">
          <Badge variant="outline" className="mb-4">
            Question
          </Badge>
          <p className="text-xl sm:text-2xl font-display font-semibold leading-relaxed max-w-2xl">
            {recallCard.question}
          </p>
          {recallRevealed ? (
            <div className="mt-8 w-full max-w-2xl rounded-xl bg-muted/50 border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Answer
              </p>
              <p className="text-lg leading-relaxed">{recallCard.answer}</p>
            </div>
          ) : (
            <p className="mt-6 text-xs text-muted-foreground">
              Try to answer in your head, then reveal or mark your recall
            </p>
          )}
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setRecallRevealed((v) => !v)}
          >
            {recallRevealed ? (
              <>
                <EyeOff className="h-4 w-4" /> Hide answer
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Reveal answer
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={handleRecallMissed}
          >
            <XCircle className="h-4 w-4" /> Missed it
          </Button>
          <Button
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleRecallGotIt}
          >
            <Check className="h-4 w-4" /> Got it
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Missed cards are rewound to the end of the queue until you nail them all.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" onClick={resetDeck} className="-ml-3">
        <ArrowLeft className="h-4 w-4" /> Back to generator
      </Button>
      <PageHeader
        title="Flashcards"
        subtitle={
          activeNoteName
            ? `Batch ${batchNumber}/${totalBatches} · "${activeNoteName}"`
            : "Tap a card to flip it."
        }
        action={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent/15 text-accent border-0 text-sm">
              {batchLearnedCount}/{currentBatch.length} batch learned
            </Badge>
            <Button variant="outline" size="sm" onClick={resetDeck}>
              <RotateCcw className="h-3.5 w-3.5" /> New deck
            </Button>
          </div>
        }
      />

      <Progress
        value={currentBatch.length > 0 ? (batchLearnedCount / currentBatch.length) * 100 : 0}
        className="h-2"
      />

      {card && (
        <div className="relative h-80 sm:h-96" style={{ perspective: 1500 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={card.id + (flipped ? "-b" : "-f")}
              initial={{ opacity: 0, rotateY: flipped ? -180 : 180 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              <Card
                onClick={() => setFlipped((f) => !f)}
                className={cn(
                  "h-full p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer shadow-glow border-border/50",
                  flipped ? "bg-gradient-primary text-primary-foreground" : "bg-card",
                )}
              >
                <Badge variant={flipped ? "secondary" : "outline"} className="mb-4">
                  {flipped ? "Answer" : "Question"}
                </Badge>
                <p className="text-xl sm:text-2xl font-display font-semibold leading-relaxed max-w-2xl">
                  {flipped ? card.answer : card.question}
                </p>
                <p
                  className={cn(
                    "mt-6 text-xs",
                    flipped ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  Tap card to {flipped ? "see question" : "reveal answer"}
                </p>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground tabular-nums">
            {index + 1} / {deck.length}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={prev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={shuffle}>
            <Shuffle className="h-4 w-4" /> Shuffle
          </Button>
          <Button onClick={mark} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Check className="h-4 w-4" /> Learned
          </Button>
          <Button variant="outline" onClick={next}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-6 shadow-card border-border/50">
        <h3 className="font-display font-semibold mb-4">Batch progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold font-display text-gradient">{batchLearnedCount}</p>
            <p className="text-xs text-muted-foreground">Learned this batch</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-display">
              {currentBatch.length - batchLearnedCount}
            </p>
            <p className="text-xs text-muted-foreground">Left in batch</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-display">
              {currentBatch.length > 0
                ? Math.round((batchLearnedCount / currentBatch.length) * 100)
                : 0}
              %
            </p>
            <p className="text-xs text-muted-foreground">Batch complete</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Mark all {currentBatch.length} cards in this batch as learned to unlock the recall test.
        </p>
      </Card>

      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
            <DialogTitle className="font-display text-2xl">Batch complete!</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p className="text-5xl font-bold font-display text-gradient">{batchScore}%</p>
                <p className="text-sm text-muted-foreground">Your recall power this batch</p>
                <p className="text-sm">{getCompletionMessage(batchScore)}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            {recallFirstPass.size < currentBatch.length && (
              <Button variant="outline" className="w-full" onClick={reviewMissedInBatch}>
                <RotateCcw className="h-4 w-4" />
                Rewind missed cards ({currentBatch.length - recallFirstPass.size})
              </Button>
            )}
            {hasNextBatch ? (
              <Button className="w-full bg-gradient-primary shadow-glow" onClick={startNextBatch}>
                <ChevronRight className="h-4 w-4" />
                Next batch ({batchNumber + 1}/{totalBatches})
              </Button>
            ) : (
              <Button className="w-full bg-gradient-primary shadow-glow" onClick={resetDeck}>
                <Sparkles className="h-4 w-4" />
                Generate a new deck
              </Button>
            )}
            <Button variant="ghost" className="w-full" onClick={() => setShowCompleteDialog(false)}>
              Stay on this deck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
