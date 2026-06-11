import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Brain, Clock, ChevronLeft, ChevronRight, Trophy, RotateCcw, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { quizQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Stage = "setup" | "playing" | "result";
type Difficulty = "Easy" | "Medium" | "Hard";

export const Route = createFileRoute("/app/quizzes")({
  head: () => ({ meta: [{ title: "Quiz Generator — StudyMate AI" }] }),
  component: Quizzes,
});

function Quizzes() {
  const [stage, setStage] = useState<Stage>("setup");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (stage !== "playing") return;
    if (timeLeft <= 0) { setStage("result"); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, timeLeft]);

  if (stage === "setup") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Quiz Generator" subtitle="AI-generated quizzes tailored to your notes." />
        <Card className="p-8 shadow-card border-border/50">
          <div className="text-center mb-8">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow mb-4">
              <Brain className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold">Binary Trees Quiz</h2>
            <p className="text-muted-foreground mt-1">From "Data Structures - Trees.pdf"</p>
          </div>
          <div>
            <p className="font-medium text-sm mb-3">Select difficulty</p>
            <div className="grid grid-cols-3 gap-3">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "rounded-xl border p-4 transition-all text-left",
                    difficulty === d ? "border-primary bg-primary/5 shadow-glow/30" : "hover:border-primary/50",
                  )}
                >
                  <div className="font-semibold">{d}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {d === "Easy" ? "Basic recall" : d === "Medium" ? "Application" : "Deep analysis"}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
            <Info label="Questions" value={String(quizQuestions.length)} />
            <Info label="Time Limit" value="60s" />
            <Info label="Points" value={String(quizQuestions.length * 10)} />
          </div>
          <Button
            className="w-full mt-8 h-12 bg-gradient-primary hover:opacity-90 shadow-glow text-base"
            onClick={() => { setStage("playing"); setCurrent(0); setAnswers(Array(quizQuestions.length).fill(null)); setTimeLeft(60); }}
          >
            Start Quiz
          </Button>
        </Card>
      </div>
    );
  }

  if (stage === "playing") {
    const q = quizQuestions[current];
    const selected = answers[current];
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Question {current + 1} of {quizQuestions.length}</p>
            <Badge variant="secondary" className="mt-1">{difficulty}</Badge>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold tabular-nums",
            timeLeft < 10 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-card",
          )}>
            <Clock className="h-4 w-4" /> {timeLeft}s
          </div>
        </div>
        <Progress value={((current + 1) / quizQuestions.length) * 100} className="h-2" />
        <Card className="p-6 sm:p-8 shadow-card border-border/50">
          <h2 className="font-display text-xl sm:text-2xl font-semibold leading-snug">{q.question}</h2>
          <div className="mt-6 space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers((a) => a.map((v, idx) => (idx === current ? i : v)))}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3",
                  selected === i ? "border-primary bg-primary/10 shadow-glow/20" : "hover:border-primary/50 hover:bg-muted/40",
                )}
              >
                <span className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg font-semibold text-sm",
                  selected === i ? "bg-gradient-primary text-primary-foreground" : "bg-muted",
                )}>{String.fromCharCode(65 + i)}</span>
                <span className="font-medium">{opt}</span>
              </button>
            ))}
          </div>
        </Card>
        <div className="flex justify-between gap-3">
          <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          {current < quizQuestions.length - 1 ? (
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

  // Result
  const correct = answers.filter((a, i) => a === quizQuestions[i].correct).length;
  const wrong = quizQuestions.length - correct;
  const score = Math.round((correct / quizQuestions.length) * 100);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-8 text-center shadow-glow border-border/50 bg-gradient-soft">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-primary shadow-glow mb-4">
          <Trophy className="h-9 w-9 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-bold font-display">Quiz Complete!</h2>
        <p className="text-muted-foreground mt-1">Here's how you did</p>
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

      <Card className="p-6 shadow-card border-border/50">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Improvement Suggestions
        </h3>
        <ul className="space-y-2 text-sm text-foreground/80">
          <li>• Review tree traversal algorithms (inorder, preorder, postorder)</li>
          <li>• Practice more on time/space complexity analysis</li>
          <li>• Re-read the section on heap implementations</li>
        </ul>
      </Card>

      <Button className="w-full bg-gradient-primary shadow-glow" onClick={() => setStage("setup")}>
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
