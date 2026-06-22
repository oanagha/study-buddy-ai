import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Brain,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  FileText,
  FileType,
  File as FileIcon,
  FileCode,
} from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { LoadingState } from "@/components/loading-spinner";
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
import { refreshNotificationsAfterActivity } from "@/lib/notifications";
import { generateQuiz, completeQuiz, type QuizDifficulty, type QuizQuestion } from "@/lib/api/quiz";
import { type Note } from "@/lib/api/notes";
import { useNotesQuery } from "@/lib/queries/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Stage = "setup" | "playing" | "result";

type QuizSearch = {
  noteId?: number;
};

export const Route = createFileRoute("/app/quizzes")({
  validateSearch: (search: Record<string, unknown>): QuizSearch => {
    const raw = search.noteId;
    if (raw === undefined || raw === null || raw === "") return {};
    const noteId = Number(raw);
    return Number.isInteger(noteId) && noteId > 0 ? { noteId } : {};
  },
  head: () => ({ meta: [{ title: "Quiz Generator — StudyMate AI" }] }),
  component: Quizzes,
});

const fileIcons: Record<string, typeof FileText> = { pdf: FileType, docx: FileIcon, txt: FileCode };
const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30];

function Quizzes() {
  const { noteId: urlNoteId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [stage, setStage] = useState<Stage>("setup");
  const { data: notes = [], isPending: loadingNotes, error: notesError } = useNotesQuery();
  const [generating, setGenerating] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(urlNoteId ?? null);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizMeta, setQuizMeta] = useState<{ quizId: number; fileName: string } | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const completionRecorded = useRef(false);

  const selectedNote = notes.find((n) => n.noteId === selectedNoteId) ?? null;

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

  useEffect(() => {
    if (stage !== "playing") return;
    if (timeLeft <= 0) {
      setStage("result");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, timeLeft]);

  useEffect(() => {
    if (stage !== "result" || !quizMeta || questions.length === 0 || completionRecorded.current) {
      return;
    }

    const correct = answers.filter((a, i) => a === questions[i]?.correct_index).length;
    const score = Math.round((correct / questions.length) * 100);

    completionRecorded.current = true;
    void completeQuiz(quizMeta.quizId, {
      score,
      correct_count: correct,
      total_questions: questions.length,
    })
      .then(() => refreshNotificationsAfterActivity())
      .catch(() => {
        completionRecorded.current = false;
      });
  }, [stage, quizMeta, questions, answers]);

  const handleSelectNote = (noteId: string) => {
    const id = Number(noteId);
    setSelectedNoteId(id);
    void navigate({ search: { noteId: id }, replace: true });
  };

  const handleGenerateAndStart = async () => {
    if (!selectedNote) {
      toast.error("Please select a note first.");
      return;
    }

    setGenerating(true);

    try {
      const result = await generateQuiz(selectedNote.noteId, difficulty, questionCount);
      setQuestions(result.questions);
      setQuizMeta({ quizId: result.quiz_id, fileName: selectedNote.fileName });
      setAnswers(Array(result.questions.length).fill(null));
      setCurrent(0);
      setTimeLeft(Math.max(60, result.questions.length * 30));
      setStage("playing");

      if (result.cached) {
        toast.success("Quiz loaded from cache.");
      } else {
        toast.success("Quiz generated successfully!");
        refreshNotificationsAfterActivity();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to generate quiz.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const resetToSetup = () => {
    completionRecorded.current = false;
    setStage("setup");
    setQuestions([]);
    setQuizMeta(null);
    setAnswers([]);
    setCurrent(0);
    void navigate({ search: {}, replace: true });
  };

  if (stage === "setup") {
    return (
      <div className="w-full max-w-6xl mx-auto px-10 flex flex-col gap-8">
        <PageHeader title="Quizzes" subtitle="Test your knowledge across your uploaded notes." />

        {loadingNotes ? (
          <LoadingState label="Loading notes" className="py-16 text-muted-foreground" />
        ) : notes.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground rounded-[32px] border-border/50">
            No notes uploaded yet. Upload a PDF, DOCX, or TXT file first to generate quizzes.
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Featured Hero Card (8 cols) */}
            <div className="lg:col-span-8 group relative overflow-hidden rounded-[32px] border border-border/50 bg-card/60 backdrop-blur-md min-h-[500px] p-8 md:p-10 shadow-2xl transition-all hover:border-primary/30 flex flex-col">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/30">
                      New Challenge
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">
                      Generate a Quiz
                    </h2>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <Label>Select note</Label>
                    <Select
                      value={selectedNoteId ? String(selectedNoteId) : undefined}
                      onValueChange={handleSelectNote}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
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
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="font-medium text-sm mb-3">Select difficulty</p>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Easy", "Medium", "Hard"] as QuizDifficulty[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={cn(
                            "rounded-xl border p-4 transition-all text-left",
                            difficulty === d
                              ? "border-primary bg-primary/10 shadow-glow/30"
                              : "border-border/50 bg-background/40 hover:border-primary/50",
                          )}
                        >
                          <div className="font-semibold">{d}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {d === "Easy"
                              ? "Basic recall"
                              : d === "Medium"
                                ? "Application"
                                : "Deep analysis"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Number of questions</Label>
                    <Select
                      value={String(questionCount)}
                      onValueChange={(v) => setQuestionCount(Number(v))}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_COUNTS.map((count) => (
                          <SelectItem key={count} value={String(count)}>
                            {count} questions
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full mt-8 h-14 bg-gradient-primary hover:opacity-90 shadow-glow text-base rounded-2xl"
                  disabled={generating || !selectedNote}
                  onClick={() => void handleGenerateAndStart()}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    "Generate & Start Quiz"
                  )}
                </Button>
              </div>
            </div>

            {/* Stats Sidebar (4 cols) */}
            <div className="lg:col-span-4 rounded-[32px] border border-border/50 bg-card/40 backdrop-blur-3xl p-8 flex flex-col justify-between hover:border-border transition-all">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Your Stats</h3>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-background/40 border border-border/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Questions Ready</span>
                      <span className="text-sm font-bold text-primary">{questionCount}</span>
                    </div>
                    <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.5)] transition-all"
                        style={{ width: `${(questionCount / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-background/40 border border-border/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Time Limit</span>
                      <span className="text-sm font-bold text-indigo-400">
                        {Math.max(60, questionCount * 30)}s
                      </span>
                    </div>
                    <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-background/40 border border-border/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Points Available</span>
                      <span className="text-sm font-bold text-amber-400">{questionCount * 10}</span>
                    </div>
                    <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all"
                        style={{ width: `${(questionCount / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                      Notes Available
                    </p>
                    <p className="text-2xl font-bold">{notes.length}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-semibold">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (stage === "playing" && questions.length > 0) {
    const q = questions[current];
    const selected = answers[current];

    return (
      <div className="max-w-6xl mx-auto space-y-6 px-10">
        <Button variant="ghost" onClick={resetToSetup} className="-ml-3">
          <ArrowLeft className="h-4 w-4" /> Back to setup
        </Button>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Question {current + 1} of {questions.length}
            </p>
            {quizMeta && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                {quizMeta.fileName}
              </p>
            )}
            <Badge variant="secondary" className="mt-1">
              {difficulty}
            </Badge>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold tabular-nums",
              timeLeft < 10
                ? "bg-destructive/10 text-destructive border-destructive/30"
                : "bg-card",
            )}
          >
            <Clock className="h-4 w-4" /> {timeLeft}s
          </div>
        </div>
        <Progress value={((current + 1) / questions.length) * 100} className="h-2" />
        <Card className="p-6 sm:p-8 shadow-card border-border/50">
          <h2 className="font-display text-xl sm:text-2xl font-semibold leading-snug">
            {q.question}
          </h2>
          <div className="mt-6 space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAnswers((a) => a.map((v, idx) => (idx === current ? i : v)))}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3",
                  selected === i
                    ? "border-primary bg-primary/10 shadow-glow/20"
                    : "hover:border-primary/50 hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg font-semibold text-sm",
                    selected === i ? "bg-gradient-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="font-medium">{opt}</span>
              </button>
            ))}
          </div>
        </Card>
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent((c) => c + 1)} className="bg-gradient-primary">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setStage("result")} className="bg-gradient-primary shadow-glow">
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    );
  }

  const correct = answers.filter((a, i) => a === questions[i]?.correct_index).length;
  const wrong = questions.length - correct;
  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-10">
      <Button variant="ghost" onClick={resetToSetup} className="-ml-3">
        <ArrowLeft className="h-4 w-4" /> Back to setup
      </Button>
      <Card className="p-8 text-center shadow-glow border-border/50 bg-gradient-soft">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-primary shadow-glow mb-4">
          <Trophy className="h-9 w-9 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-bold font-display">Quiz Complete!</h2>
        <p className="text-muted-foreground mt-1">Here&apos;s how you did</p>
        <div className="text-7xl font-bold font-display mt-6 text-gradient">{score}%</div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mt-8">
          <div className="rounded-xl bg-card p-4 border">
            <CheckCircle2 className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold">{correct}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-xl bg-card p-4 border">
            <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold">{wrong}</p>
            <p className="text-xs text-muted-foreground">Wrong</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card border-border/50 space-y-4">
        <h3 className="font-display font-semibold text-lg">Review Answers</h3>
        {questions.map((q, i) => {
          const userAnswer = answers[i];
          const isCorrect = userAnswer === q.correct_index;
          return (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <p className="font-medium text-sm">
                {i + 1}. {q.question}
              </p>
              <p className={cn("text-sm", isCorrect ? "text-green-600" : "text-destructive")}>
                Your answer: {userAnswer !== null ? q.options[userAnswer] : "Not answered"}
                {!isCorrect && (
                  <span className="block text-muted-foreground mt-1">
                    Correct: {q.options[q.correct_index]}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </Card>

      <Button className="w-full bg-gradient-primary shadow-glow" onClick={resetToSetup}>
        <RotateCcw className="h-4 w-4" /> Try Another Quiz
      </Button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold font-display">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
