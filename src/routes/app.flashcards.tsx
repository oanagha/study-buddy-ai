import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Check,
  Layers,
  Loader2,
  Sparkles,
  FileText,
  FileType,
  File as FileIcon,
  FileCode,
  RotateCcw,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/auth";
import { fetchFlashcards, generateFlashcards, type Flashcard } from "@/lib/api/flashcards";
import { fetchNotes, type Note } from "@/lib/api/notes";
import { toast } from "sonner";

type FlashcardSearch = {
  noteId?: number;
};

type DeckCard = Flashcard & { id: string };

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

function Flashcards() {
  const { noteId: urlNoteId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(urlNoteId ?? null);
  const [cardCount, setCardCount] = useState(20);
  const [deck, setDeck] = useState<DeckCard[]>([]);
  const [activeNoteName, setActiveNoteName] = useState<string | null>(null);
  const [hasDeck, setHasDeck] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const skipAutoLoadRef = useRef(false);

  const selectedNote = notes.find((n) => n.noteId === selectedNoteId) ?? null;
  const card = deck[index];

  const loadNotes = useCallback(async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
      if (urlNoteId && data.some((n) => n.noteId === urlNoteId)) {
        setSelectedNoteId(urlNoteId);
      } else if (!selectedNoteId && data.length > 0) {
        setSelectedNoteId(data[0].noteId);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to load notes.");
      }
    } finally {
      setLoadingNotes(false);
    }
  }, [urlNoteId, selectedNoteId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

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
    setIndex(0);
    setFlipped(false);
    setLearned(new Set());
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

      setNotes((prev) =>
        prev.map((n) =>
          n.noteId === selectedNote.noteId ? { ...n, hasFlashcards: true } : n,
        ),
      );

      if (result.cached) {
        toast.success("Flashcards loaded from cache.");
      } else {
        toast.success("Flashcards generated successfully!");
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
    setDeck((d) => [...d].sort(() => Math.random() - 0.5));
  };

  const mark = () => {
    if (!card) return;
    setLearned((s) => new Set(s).add(card.id));
    setTimeout(next, 300);
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
    setHasDeck(false);
    setDeck([]);
    setActiveNoteName(null);
    setIndex(0);
    setFlipped(false);
    setLearned(new Set());
  };

  if (loadingSaved) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading saved flashcards...
      </div>
    );
  }

  if (!hasDeck || deck.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Flashcards"
          subtitle="Generate AI flashcards from your uploaded notes."
        />

        {loadingNotes ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your notes...
          </div>
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Flashcards"
        subtitle={activeNoteName ? `From "${activeNoteName}"` : "Tap a card to flip it."}
        action={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent/15 text-accent border-0 text-sm">
              {learned.size}/{deck.length} learned
            </Badge>
            <Button variant="outline" size="sm" onClick={resetDeck}>
              <RotateCcw className="h-3.5 w-3.5" /> New deck
            </Button>
          </div>
        }
      />

      <Progress value={(learned.size / deck.length) * 100} className="h-2" />

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
              className={`h-full p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer shadow-glow border-border/50 ${
                flipped ? "bg-gradient-primary text-primary-foreground" : "bg-card"
              }`}
            >
              <Badge variant={flipped ? "secondary" : "outline"} className="mb-4">
                {flipped ? "Answer" : "Question"}
              </Badge>
              <p className="text-xl sm:text-2xl font-display font-semibold leading-relaxed max-w-2xl">
                {flipped ? card.answer : card.question}
              </p>
              <p
                className={`mt-6 text-xs ${flipped ? "text-primary-foreground/70" : "text-muted-foreground"}`}
              >
                Tap card to {flipped ? "see question" : "reveal answer"}
              </p>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

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
        <h3 className="font-display font-semibold mb-4">Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold font-display text-gradient">{learned.size}</p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{deck.length - learned.size}</p>
            <p className="text-xs text-muted-foreground">To review</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-display">
              {Math.round((learned.size / deck.length) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Completion</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
