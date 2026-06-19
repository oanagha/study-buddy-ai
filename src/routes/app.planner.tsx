import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  BookOpen,
  Sparkles,
  Check,
  Loader2,
  Trophy,
  PartyPopper,
} from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/auth";
import { refreshNotificationsAfterActivity } from "@/lib/notifications";
import {
  fetchActiveStudyPlan,
  generateStudyPlan,
  getRandomCompletionQuote,
  updateStudyPlanProgress,
  type StudyLevel,
  type StudyPlanDay,
  type StudyPlanResult,
} from "@/lib/api/studyPlan";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/planner")({
  head: () => ({ meta: [{ title: "Study Planner — StudyMate AI" }] }),
  component: Planner,
});

function getDefaultExamDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function applyPlanResult(result: StudyPlanResult) {
  if (!result.plan_id || result.study_plan.length === 0) {
    return null;
  }

  return {
    plan: result.study_plan,
    meta: {
      planId: result.plan_id,
      daysRemaining: result.days_remaining ?? result.study_plan.length,
      subject: result.subject ?? "",
      examDate: result.exam_date ?? "",
      studyHours: String(result.study_hours_per_day ?? 3),
      currentLevel: (result.current_level ?? "Beginner") as StudyLevel,
    },
    doneDays: new Set(result.completed_days ?? []),
    isCompleted: result.is_completed ?? false,
  };
}

function Planner() {
  const [subject, setSubject] = useState("Data Structures");
  const [examDate, setExamDate] = useState(getDefaultExamDate());
  const [studyHours, setStudyHours] = useState("3");
  const [currentLevel, setCurrentLevel] = useState<StudyLevel>("Beginner");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [plan, setPlan] = useState<StudyPlanDay[]>([]);
  const [planMeta, setPlanMeta] = useState<{
    planId: number;
    daysRemaining: number;
    subject: string;
    examDate: string;
    studyHours: string;
    currentLevel: StudyLevel;
  } | null>(null);
  const [doneDays, setDoneDays] = useState<Set<number>>(new Set());
  const [isPlanCompleted, setIsPlanCompleted] = useState(false);
  const [completionQuote, setCompletionQuote] = useState<string | null>(null);

  const doneCount = doneDays.size;
  const allDone = plan.length > 0 && doneCount === plan.length;

  const hydrateFromResult = useCallback((result: StudyPlanResult) => {
    const applied = applyPlanResult(result);
    if (!applied) return false;

    setPlan(applied.plan);
    setPlanMeta(applied.meta);
    setDoneDays(applied.doneDays);
    setIsPlanCompleted(applied.isCompleted);
    setSubject(applied.meta.subject);
    setExamDate(applied.meta.examDate);
    setStudyHours(applied.meta.studyHours);
    setCurrentLevel(applied.meta.currentLevel);

    if (applied.isCompleted) {
      setCompletionQuote(getRandomCompletionQuote());
    } else {
      setCompletionQuote(null);
    }

    return true;
  }, []);

  const loadActivePlan = useCallback(async () => {
    setLoadingPlan(true);
    try {
      const result = await fetchActiveStudyPlan();
      hydrateFromResult(result);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      }
    } finally {
      setLoadingPlan(false);
    }
  }, [hydrateFromResult]);

  useEffect(() => {
    void loadActivePlan();
  }, [loadActivePlan]);

  const handleGenerate = async () => {
    const hours = Number(studyHours);
    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
      toast.error("Daily study hours must be between 1 and 24.");
      return;
    }

    setGenerating(true);

    try {
      const result = await generateStudyPlan({
        subject: subject.trim(),
        exam_date: examDate,
        study_hours_per_day: hours,
        current_level: currentLevel,
      });

      hydrateFromResult(result);
      setIsPlanCompleted(false);
      setCompletionQuote(null);

      if (result.cached) {
        toast.success("Study plan loaded from cache.");
      } else {
        toast.success("Study plan generated successfully!");
        refreshNotificationsAfterActivity();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to generate study plan.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const persistProgress = async (nextDoneDays: Set<number>, showCongrats: boolean) => {
    if (!planMeta) return;

    setSavingProgress(true);
    try {
      const result = await updateStudyPlanProgress(planMeta.planId, [...nextDoneDays]);
      setDoneDays(new Set(result.completed_days ?? []));
      setIsPlanCompleted(Boolean(result.is_completed));

      if (showCongrats && result.is_completed) {
        const quote = getRandomCompletionQuote();
        setCompletionQuote(quote);
        toast.success("Congratulations! You completed your entire study plan!");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to save progress.");
      }
    } finally {
      setSavingProgress(false);
    }
  };

  const toggleDone = (day: number) => {
    if (!planMeta || isPlanCompleted) return;

    const next = new Set(doneDays);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }

    setDoneDays(next);
    const willComplete = next.size === plan.length;
    void persistProgress(next, willComplete);
  };

  const startNewPlan = () => {
    setPlan([]);
    setPlanMeta(null);
    setDoneDays(new Set());
    setIsPlanCompleted(false);
    setCompletionQuote(null);
  };

  const isRevisionTopic = (topic: string) =>
    /revision|review|mock|practice exam|final prep/i.test(topic);

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading your study plan...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Study Planner"
        subtitle="AI-generated study schedules tailored to your exam."
      />

      {(allDone || isPlanCompleted) && completionQuote && (
        <Card className="p-6 shadow-glow border-primary/30 bg-gradient-soft text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl font-bold">Plan Complete!</h3>
            <PartyPopper className="h-5 w-5 text-primary scale-x-[-1]" />
          </div>
          <p className="text-foreground/90 max-w-2xl mx-auto leading-relaxed">{completionQuote}</p>
          <Button className="mt-5 bg-gradient-primary shadow-glow" onClick={startNewPlan}>
            Start a New Study Plan
          </Button>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card className="p-6 shadow-card border-border/50 h-fit">
          <h3 className="font-display font-semibold text-lg mb-4">Plan Settings</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="exam">Exam Date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="exam"
                  type="date"
                  className="pl-9"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  disabled={plan.length > 0 && !isPlanCompleted}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="subject"
                  className="pl-9"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Data Structures"
                  disabled={plan.length > 0 && !isPlanCompleted}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hours">Daily Study Hours</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hours"
                  type="number"
                  className="pl-9"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  min="1"
                  max="24"
                  step="0.5"
                  disabled={plan.length > 0 && !isPlanCompleted}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Current Level</Label>
              <Select
                value={currentLevel}
                onValueChange={(v) => setCurrentLevel(v as StudyLevel)}
                disabled={plan.length > 0 && !isPlanCompleted}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-gradient-primary shadow-glow"
              disabled={generating || (plan.length > 0 && !isPlanCompleted)}
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
                  {plan.length > 0 && !isPlanCompleted ? "Plan In Progress" : "Generate Study Plan"}
                </>
              )}
            </Button>
            {plan.length > 0 && !isPlanCompleted && (
              <p className="text-xs text-muted-foreground text-center">
                Finish your current plan or mark all days done to start a new one.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          {plan.length > 0 && planMeta && (
            <Card className="p-5 shadow-card border-border/50 bg-gradient-soft">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div>
                  <p className="font-semibold">{planMeta.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    Exam: {planMeta.examDate} • {planMeta.daysRemaining} days remaining
                    {savingProgress ? " • saving..." : ""}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {doneCount} of {plan.length} days
                </p>
              </div>
              <Progress value={(doneCount / plan.length) * 100} className="h-2.5" />
            </Card>
          )}

          <Card className="p-6 shadow-card border-border/50">
            {plan.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No study plan yet</p>
                <p className="text-sm mt-1">
                  Fill in your exam details and click Generate Study Plan.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-display font-semibold text-lg mb-5">
                  {plan.length}-Day Study Plan
                </h3>
                <div className="relative">
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-4">
                    {plan.map((p) => {
                      const done = doneDays.has(p.day);
                      const revision = isRevisionTopic(p.topic);

                      return (
                        <div key={`${planMeta?.planId}-${p.day}`} className="relative pl-12">
                          <div
                            className={cn(
                              "absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border-2",
                              done
                                ? "bg-accent border-accent text-accent-foreground"
                                : "bg-card border-border",
                            )}
                          >
                            {done ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-bold">{p.day}</span>
                            )}
                          </div>
                          <div
                            className={cn(
                              "p-4 rounded-xl border transition",
                              done
                                ? "bg-accent/5 border-accent/20"
                                : revision
                                  ? "border-amber-500/30 bg-amber-500/5"
                                  : "hover:border-primary/40",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold">{p.topic}</p>
                                  {revision && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-amber-500/40 text-amber-700 dark:text-amber-400"
                                    >
                                      Revision
                                    </Badge>
                                  )}
                                  {done && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-accent/15 text-accent border-0 text-xs"
                                    >
                                      Done
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Day {p.day} • {p.estimated_hours}h study time
                                </p>
                              </div>
                              {!done && !isPlanCompleted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={savingProgress}
                                  onClick={() => toggleDone(p.day)}
                                >
                                  Mark Done
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
